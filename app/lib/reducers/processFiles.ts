import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { AppState, UploadedFile } from '@/app/types';

const initialState: AppState = {
    uploadedFiles: [],
    decompressedFiles: [],
    decompressionResult: {
        decompressedFiles: [],
        totalFiles: 0
    },
    decompressionStatus: {
        status: 'idle',
        error: undefined, 
    },
    error: null,
    isLoading: false
}

const processFiles = createSlice({
    name: 'processFiles',
    initialState,
    reducers: {
        uploadFile: (state, action: PayloadAction<UploadedFile>) => {
            const { file, fileName, fileSize, fileType } = action.payload;
            state.uploadedFiles.push({ file, fileName, fileSize, fileType });
        },
        removeFile: (state, action: PayloadAction<{ index: number }>) => {
            const index = action.payload.index;
            const file = state.uploadedFiles[index]
            if (file) {
                state.uploadedFiles = state.uploadedFiles.splice(index)
            }
        }
    }
})

export const { uploadFile, removeFile } = processFiles.actions;
export const processFile = (state: RootState) => state.process;
export default processFiles.reducer;
