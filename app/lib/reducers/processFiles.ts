import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    convertToCsv,
    convertToDocx, 
    convertToJpg, 
    convertToPdf,
     convertToPng,
      convertToXlsb 
} from "../../utils/fileConversions";
import { AppState, UploadedFile, FileConversion, UpdateFile } from '@/app/utils/types';
import { validateSelectedFiles } from '@/app/utils/fileValidation';

const initialState: AppState = {
    uploadedFiles: [],
    fileConversion: {
        conversionList: [],
        conversion: ''
    }
}

// const formatFile = createAsyncThunk()

const processFiles = createSlice({
    name: 'processFiles',
    initialState,
    reducers: {
        uploadFile: (state, action: PayloadAction<UploadedFile>) => {
            const { file, fileName, fileSize, fileType, status, id } = action.payload;
            state.uploadedFiles.push({ file, fileName, fileSize, fileType, status, id });
        },
        removeFile: (state, action: PayloadAction<UploadedFile['fileName']>) => {
            const index = state.uploadedFiles.findIndex(file => file.fileName === action.payload);
            if (index !== -1) {
                state.uploadedFiles.splice(index, 1);
            }
        },
        clearAllFiles: (state) => {
          state.uploadedFiles = initialState.uploadedFiles;
          state.fileConversion = initialState.fileConversion; 
        },
        updateStatus: (state, action: PayloadAction<UpdateFile>) => {
            const { id, status } = action.payload;
            const updatedFile = state.uploadedFiles.find((file) => file.id === id);
            if (updatedFile) {
                updatedFile.status = status
            }
        },
        updateFileConversions: (state, action: PayloadAction<FileConversion>) => {
            state.fileConversion.conversionList = action.payload.conversionList;
            state.fileConversion.conversion = action.payload.conversion;
        },
        setError: (state, action: PayloadAction<UpdateFile>) => {
            const { id, status, error } = action.payload;
            const updatedFile = state.uploadedFiles.find((file) => file.id === id);
            if (updatedFile) {
                updatedFile.status = status;
                updatedFile.error = error
            }
        },
    }
})

export const { uploadFile, removeFile, updateStatus, setError } = processFiles.actions;
export default processFiles.reducer;
