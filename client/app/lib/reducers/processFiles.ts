import { createSlice, PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import { FileState, FilesState, FileMetadata, FileStatus } from '@/app/utils/types';
import axios from 'axios';

const initialState: FilesState = {
    files: [],
}

const backendURL = 'http://localhost:5000'

export const convertFile = createAsyncThunk <
    { fileState: FileState },
    FileState,
    { rejectValue: FileState }
    >(
        '/api/convertFile',
        async ( fileState: FileState , thunkAPI) => {
            const formData = new FormData();
            formData.append('fileState', JSON.stringify(fileState))
            try {
                const response = await axios.post<FileState>(`${backendURL}/api/convertFile`, formData);
                console.debug("convertFile response: ", JSON.stringify(response.data))

                if (response.data.fileStatus.status === 'failure') {
                    throw new Error(response.data.fileStatus.error)
                }

                return { fileState: response.data };
            } catch (err) {
                console.error(`Failed to convert file ${fileState.metadata.fileName} error: ${err}`)
                return thunkAPI.rejectWithValue(fileState)
            }
        }
)

export const uploadFileToBackend = createAsyncThunk<
  { fileStatus: FileStatus },                    // fulfilled return type
  { fileState: FileState; fileObj: File },       // thunk argument type
  { rejectValue: FileStatus }                    // rejectWithValue type
>(
  '/api/upload',
  async ({ fileState, fileObj }, thunkAPI) => {
    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('id', fileState.metadata.id || '');
    formData.append('file_name', fileState.metadata.fileName);

    try {
        const response = await axios.post<FileStatus>(`${backendURL}/api/upload`, formData);
        console.debug("uploadFile response: ", JSON.stringify(response.data));
        if (response.data.status === 'failure') {
            return thunkAPI.rejectWithValue({status: "failure", error: response.data.error})
        }

        return { fileID: fileState.metadata.id || '', fileStatus: response.data };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return thunkAPI.rejectWithValue({ status: 'failure', error: errorMsg });
    }
  }
);

export const removeFileFromBackend = createAsyncThunk(
    '/api/removeFile',
    async (file: FileState, thunkAPI) => {
        console.log(`Notifying backend to remove ${file.metadata.fileName}`)
        const formData = new FormData()
        formData.append('id', file.metadata.id || '');
        formData.append('file_name', file.metadata.fileName);
        try {
            const response = await axios.post<FileStatus>(`${backendURL}/api/removeFile`, formData);

            if (response.data.status === 'failure') {
                return thunkAPI.rejectWithValue(response.data.error)
            }
            return { status: response.data }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            return thunkAPI.rejectWithValue({ error: errorMsg });
        }
    }
)

function removeFileById(fileState: FileState[], id?: FileMetadata['id']) {
    if (!id) {
        console.error("No ID argument!")
        return
    } 
    const index = fileState.findIndex(file => file.metadata.id === id);
    if (index !== -1) fileState.splice(index, 1);
}

const processFiles = createSlice({
    name: 'processFiles',
    initialState,
    reducers: {
        uploadFile: (state, action: PayloadAction<FileState>) => {
            state.files.push(action.payload)
        },
        removeFile: (state, action: PayloadAction<FileState>) => {
            const fileIndex = state.files.findIndex(file => file.metadata.id === action.payload.metadata.id)
            state.files.splice(fileIndex, 1)
        }
    },
    extraReducers: (builder) => {
        // convertFile
        builder.addCase(convertFile.pending, (state, action) => {
            const fileState: FileState = action.meta.arg;
            const fileName = fileState.metadata.fileName
            console.debug(`${fileName} is being evaluated by backend.`);
            const existingFileIndex = state.files.findIndex(file => fileState.metadata.id === file.metadata.id);
            state.files[existingFileIndex].fileStatus = {
                status: 'loading',
                error: ''
            }
        }),  
            
        builder.addCase(convertFile.fulfilled, (state, action) => {
            // The backend has already set new state for the file
            const newFileState: FileState = action.meta.arg;
            const formerFileIndex = state.files.findIndex(file => file.metadata.id === action.meta.arg.metadata.id)
            const formerFileName = state.files[formerFileIndex].metadata.fileName;
            const formerFileExt = state.files[formerFileIndex].metadata.fileExtension
            console.debug(`File ${formerFileName} successfully converted from ${formerFileExt} to ${newFileState.fileConversions?.conversion}`)
            state.files[formerFileIndex] = newFileState
        }),
   
        builder.addCase(convertFile.rejected, (state, action) => {
            const fileID = action.meta.arg.metadata.id;
            const fileName = action.meta.arg.metadata.fileName;
            console.error(`Failed to convert file ${fileName}. Error: ${action.payload || 'Unknown error'}`);
            const existingFileIndex = state.files.findIndex(file => file.metadata.id === fileID);
                if (existingFileIndex !== -1) {
                state.files[existingFileIndex].fileStatus = {
                    status: 'failure',
                    error: action.payload ? String(action.payload) : 'Conversion failed'
                };
            }
        })

        // uploadFileToBackend
        builder.addCase(uploadFileToBackend.pending, (state, action) => {
            const fileState = action.meta.arg.fileState;
            const fileName = fileState.metadata.fileName;
            console.debug(`File: ${fileName} is being uploaded to backend.`)
            state.files.push({
                ...fileState,
                fileStatus: { status: 'loading', error: '' }
            })
        }),
            
        builder.addCase(uploadFileToBackend.fulfilled, (state, action) => {
            const fileName = action.meta.arg.fileState.metadata.fileName
            const newStatus = action.payload.fileStatus
            console.debug(`File ${fileName} has successfully been uploaded to backend.`)
            const existingFileIndex = state.files.findIndex(file => file.metadata.id === action.meta.arg.fileState.metadata.id)
            state.files[existingFileIndex].fileStatus = newStatus
        }),
            
        builder.addCase(uploadFileToBackend.rejected, (state, action) => {
            const fileName = action.meta.arg.fileState.metadata.fileName
            console.error(`Failed to upload file ${fileName} to backend. Changing status to failure`)
            const existingFileIndex = state.files.findIndex(file => file.metadata.id === action.meta.arg.fileState.metadata.id)
            if (state.files[existingFileIndex]) {
                removeFileById(state.files, state.files[existingFileIndex].metadata.id)
            }
        })

        //removeFileFromBackend
        builder.addCase(removeFileFromBackend.fulfilled, (state, action) => {
            const fileID = action.meta.arg.metadata.id;
            const fileToRemove = state.files.find(file => action.meta.arg.metadata.id === file.metadata.id)
            console.debug(`Successfully removed file ${fileToRemove?.metadata.fileName}`)
            removeFileById(state.files, fileID)
        })

        builder.addCase(removeFileFromBackend.rejected, (state, action) => {
            const fileID = action.meta.arg.metadata.id;
            const fileToRemove = state.files.find(file => action.meta.arg.metadata.id === file.metadata.id)
            console.error(`Server error occurred while removing file ${fileToRemove?.metadata.fileName}. error: ${action.payload}`)
            removeFileById(state.files, fileID)
        })
    }
})

export const { uploadFile, removeFile } = processFiles.actions;
export default processFiles.reducer;
