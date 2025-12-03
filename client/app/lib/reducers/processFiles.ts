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
                console.error(`Failed to convert file ${fileState.metadata.fileName}. error: ${fileState.fileStatus.error}`)
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
        console.log(`removeFileFromBackend: Notifying backend to remove ${file.metadata.fileNameShortened} from /tmp`)
        const formData = new FormData()
        formData.append('id', file.metadata.id || '');
        formData.append('file_name', file.metadata.fileName);
        try {
            const response = await axios.post<FileStatus>(`${backendURL}/api/removeFile`, formData)
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
            const fileState: FileState = action.meta.arg
            console.debug(`${fileState.metadata.fileName} is being converted. Changing status to loading`);
            const existingFileIndex = state.files.findIndex(file => file.metadata.id === action.meta.arg.metadata.id)
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
            const newFileState: FileState = action.meta.arg;
            const fileName = newFileState.metadata.fileName
            const currentExt = newFileState.metadata.fileExtension;
            const preferredExt = newFileState.fileConversions?.conversion
            console.error(`convertFile failed for file ${fileName} from ${currentExt} to ${preferredExt}`)
            const existingFileIndex = state.files.findIndex(file => newFileState.metadata.id === file.metadata.id);
            state.files[existingFileIndex] = newFileState
        })

        // uploadFileToBackend
        builder.addCase(uploadFileToBackend.pending, (state, action) => {
            const fileState = action.meta.arg.fileState;
            const fileName = fileState.metadata.fileName;
            console.debug(`File: ${fileName} is being uploaded to backend. Changing status to loading`)
            const existingFileIndex = state.files.findIndex(file => fileState.metadata.id === file.metadata.id)
            state.files[existingFileIndex].fileStatus = {
                status: 'loading',
                error: ''
            }
        }),
            
        builder.addCase(uploadFileToBackend.fulfilled, (state, action) => {
            const fileName = action.meta.arg.fileState.metadata.fileName
            const newStatus = action.payload.fileStatus
            console.debug(`File ${fileName} has successfully been uploaded to backend. Changing status to success`)
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
            removeFileById(state.files, fileID)
        })
        builder.addCase(removeFileFromBackend.rejected, (state, action) => {
            const fileID = action.meta.arg.metadata.id;
            removeFileById(state.files, fileID)
        })
    }
})

export const { uploadFile, removeFile } = processFiles.actions;
export default processFiles.reducer;
