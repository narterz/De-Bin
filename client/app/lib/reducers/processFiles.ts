import { createSlice, PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import { FileState, FilesState, FileMetadata, FileStatus } from '@/app/utils/types';
import { getFileConversions } from '@/app/utils/fileValidation';
import axios, { AxiosError } from 'axios';

const initialState: FilesState = {
    files: [],
}

const backendURL = 'http://localhost:8001'

export const convertFile = createAsyncThunk<
    { fileState: FileState },         // Fulfilled response
    FileState,                        // Thunk argument (pass FileState directly)
    { rejectValue: FileStatus }       // rejectWithValue
>(
    '/api/convertFile',
    async (file, thunkAPI) => {
        const formData = new FormData();
        formData.append('fileState', JSON.stringify(file))
        try {
            // backend may return either a FileState (on success) or a FileStatus (on failure)
            const response = await axios.post<FileState | FileStatus>(`${backendURL}/api/convertFile`, formData);
            console.debug("convertFile response: ", JSON.stringify(response.data))

            if ('status' in response.data && response.data.status === 'failure') {
                const errStatus = response.data as FileStatus;
                console.error(`Failed to convert file ${file.metadata.fileName} error: ${errStatus.error}`)
                return thunkAPI.rejectWithValue({ status: "failure", error: errStatus.error })
            }

            return { fileState: response.data as FileState };
        } catch (err: any) {
            console.error(`Server error occurred while converting file ${file.metadata.fileName}. See backend for logs. ${err.message}`)
            return thunkAPI.rejectWithValue({ status: 'failure', error: "Server error has occurred." });
        }
    }
)

export const uploadFileToBackend = createAsyncThunk<
    { fileID: string; fileStatus: FileStatus },    // fulfilled return type (include fileID)
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
                console.error(`Failed to upload file ${fileState.metadata.fileName}. Error: ${response.data.error}`)
                return thunkAPI.rejectWithValue({ status: "failure", error: response.data.error })
            }

            return { fileID: fileState.metadata.id || '', fileStatus: { status: "idle", error: '' } };
        } catch (err: any) {
            console.error(`Server error occurred while removing file${fileState.metadata.fileName}. See backend for logs. ${err.message}`)
            return thunkAPI.rejectWithValue({ status: 'failure', error: "Server error has occurred." });
        }
    }
)

export const removeFileFromBackend = createAsyncThunk<
    { fileStatus: FileStatus },                    // fulfilled return type
    FileState,                                     // thunk argument type (pass FileState directly)
    { rejectValue: FileStatus }                    // rejectWithValue type
>(
    '/api/removeFile',
    async (file, thunkAPI) => {
        console.log(`Notifying backend to remove ${file.metadata.fileName}`)
        const formData = new FormData()
        formData.append('id', file.metadata.id || '');
        formData.append('file_name', file.metadata.fileName);
        try {
            const response = await axios.post<FileStatus>(`${backendURL}/api/removeFile`, formData);

            if (response.data.status === 'failure') {
                console.error(`Failed to remove file ${file.metadata.fileName}. Error: ${response.data.error}`)
                return thunkAPI.rejectWithValue({ status: 'failure', error: response.data.error })
            }
            return { fileStatus: response.data }
        } catch (err: any) {
            console.error(`Unknown server error occurred while removing file ${file.metadata.fileName}. Error: ${err.message}`)
            return thunkAPI.rejectWithValue({ status: 'failure', error: "Server error has occurred." });
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
        },
        updateFileConversion: (state, action: PayloadAction<FileState>) => {
            const fileIndex = state.files.findIndex(file => file.metadata.id === action.payload.metadata.id);
            const fileName = state.files[fileIndex].metadata.fileName;
            state.files[fileIndex] = action.payload;
            console.debug(`Successfully updated ${fileName} conversion to ${action.payload.fileConversions?.conversion}`)
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
                let newFileState: FileState = action.payload.fileState;
                newFileState.fileConversions = getFileConversions(newFileState.fileConversions?.conversion);
                const formerFileIndex = state.files.findIndex(file => file.metadata.id === newFileState.metadata.id);  // Use newFileState.id for safety
                const formerFileName = state.files[formerFileIndex]?.metadata.fileName || 'Unknown';
                const formerFileExt = state.files[formerFileIndex]?.metadata.fileExtension || 'Unknown';
                console.debug(`File ${formerFileName} successfully converted from ${formerFileExt} to ${newFileState.fileConversions?.conversion}`);
                state.files[formerFileIndex] = newFileState;
            }),

            builder.addCase(convertFile.rejected, (state, action) => {
                const fileID = action.meta.arg.metadata.id;
                const existingFileIndex = state.files.findIndex(file => file.metadata.id === fileID);
                if (existingFileIndex !== -1) {
                    state.files[existingFileIndex].fileStatus = {
                        status: 'failure',
                        error: action.payload?.error || 'Conversion failed'
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
            removeFileById(state.files, fileID)
        })
    }
})

export const { uploadFile, removeFile, updateFileConversion } = processFiles.actions;
export default processFiles.reducer;