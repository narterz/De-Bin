import { createSlice, PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import  handleFileConversion  from "../../utils/fileConversions";
import { FileState, FilesState, FileMetadata, FileConversion, AcceptedFilTypes, FileStatus } from '@/app/utils/types';
import { validateMetadata, shortenFileName, getFileExtension, getFileConversions, convertFileSize, validateDuplicateFile } from '@/app/utils/fileValidation';
import axios from 'axios';

const initialState: FilesState = {
    files: [],
}

const backendURL = 'http://localhost:5000'

export const convertFile = createAsyncThunk(
    'deBin/convertFile',
    async (file: FileState, thunkAPI) => {
        const response = await handleFileConversion(file)
        return response;
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

function updateFileStateStatus(fileState: FileState[], id?: FileMetadata['id'], status?: FileStatus['status']) {
    if (!id || !status) return;
    const index = fileState.findIndex(file => file.metadata.id === id);
    if (index === -1) return;
    fileState[index].fileStatus.status = status
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
        //convertFile
        builder.addCase(convertFile.pending, (state, action) => {
            const fileID = action.meta.arg.metadata.id
            updateFileStateStatus(state.files, fileID, "loading")
        }),
            builder.addCase(convertFile.fulfilled, (state, action) => {
            const fileID = action.meta.arg.metadata.id
            updateFileStateStatus(state.files, fileID, "success")

        }),
        builder.addCase(convertFile.rejected, (state, action) => {
            const fileID = action.meta.arg.metadata.id
            updateFileStateStatus(state.files, fileID, "failure")
        })

        // uploadFileToBackend
        builder.addCase(uploadFileToBackend.pending, (state, action) => {
            const fileState = action.meta.arg.fileState;
            console.debug(`File: ${fileState.metadata.fileName} is being evaluated`)
            state.files.push({
                ...fileState,
                fileStatus: { status: 'loading', error: '' }
            })
        }),
            builder.addCase(uploadFileToBackend.fulfilled, (state, action) => {
                const newStatus = action.payload.fileStatus
                const existingFileIndex = state.files.findIndex(file => file.metadata.id === action.meta.arg.fileState.metadata.id)
                state.files[existingFileIndex].fileStatus = newStatus
        }),
            builder.addCase(uploadFileToBackend.rejected, (state, action) => {
                if (action.payload){
                    const failureStatus = action.payload
                    const existingFileIndex = state.files.findIndex(file => file.metadata.id === action.meta.arg.fileState.metadata.id)
                    state.files[existingFileIndex].fileStatus = failureStatus
                } else {
                    console.error("uploadFileToBackend: Returned rejected with no status")
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
