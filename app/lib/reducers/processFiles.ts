import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, UploadedFile, FileConversion } from '@/app/utils/types';

const initialState: AppState = {
    uploadedFiles: [],
    fileConversion: {
        conversionList: [],
        conversion: ''
    }
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

        },
        updateFileConversions: (state, action: PayloadAction<FileConversion>) => {
            state.fileConversion.conversionList = action.payload.conversionList;
            state.fileConversion.conversion = action.payload.conversion;
        }
    }
})

export const { uploadFile, removeFile } = processFiles.actions;
export default processFiles.reducer;
