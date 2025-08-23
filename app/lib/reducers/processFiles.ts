import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { AppState, UploadedFile } from '@/app/utils/types';

const initialState: AppState = {
    uploadedFiles: [],
}

const processFiles = createSlice({
    name: 'processFiles',
    initialState,
    reducers: {
        uploadFile: (state, action: PayloadAction<UploadedFile>) => {
            const { file, fileName, fileSize, fileType, status } = action.payload;
            state.uploadedFiles.push({ file, fileName, fileSize, fileType, status });
        },
        removeFile: (state, action: PayloadAction<UploadedFile['fileName']>) => {
            const index = state.uploadedFiles.findIndex(file => file.fileName === action.payload);
            if (index !== -1) {
                state.uploadedFiles.splice(index, 1);
            }
        },
        updateStatus: (state, action: PayloadAction<string>) => {

        }
    }
})

export const { uploadFile, removeFile } = processFiles.actions;
export const processFile = (state: RootState) => state.process;
export default processFiles.reducer;
