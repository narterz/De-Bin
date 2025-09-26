import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    convertToCsv,
    convertToDocx, 
    convertToJpg, 
    convertToPdf,
    convertToPng,
    convertToXlsb 
} from "../../utils/fileConversions";
import { v4 as uuidv4 } from 'uuid';
import { AppState, UploadedFile, FileConversion, AcceptedFilTypes } from '@/app/utils/types';
import { validateSelectedFile, shortenFileName, getFileExtension, getFileConversions } from '@/app/utils/fileValidation';

const initialState: AppState = {
    uploadedFiles: [],
    fileConversion: {
        conversionList: [],
        conversion: '.zip'
    }
}

// const formatFile = createAsyncThunk()

const processFiles = createSlice({
    name: 'processFiles',
    initialState,
    reducers: {
        uploadFile: (state, action: PayloadAction<UploadedFile>) => {
            const { file, fileName, fileSize, fileType } = action.payload;
            const id = uuidv4();
            const fileNameShortened = shortenFileName(fileName);
            const fileExtension = getFileExtension(action.payload);
            let fileConversionList: FileConversion = initialState.fileConversion;
            const { status, error } = validateSelectedFile({file, fileName, fileSize, fileType});
            if (fileExtension) {
                const conversionResult = getFileConversions(fileExtension as AcceptedFilTypes);
                if (conversionResult) {
                    fileConversionList = conversionResult;
                }
            }
            const { conversionList, conversion } = fileConversionList;
            state.uploadedFiles.push({ file, id, fileNameShortened, fileExtension, fileName, fileSize, fileType, status, error });
            state.fileConversion.conversionList = conversionList;
            state.fileConversion.conversion = conversion;
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
        setFileConversion: (state, action: PayloadAction<FileConversion['conversion']>) => {
            state.fileConversion.conversion = action.payload;
        },
        updateFileConversions: (state, action: PayloadAction<FileConversion>) => {
            state.fileConversion.conversionList = action.payload.conversionList;
            state.fileConversion.conversion = action.payload.conversion;
        }
    }
})

export const { uploadFile, removeFile, setFileConversion, clearAllFiles, updateFileConversions } = processFiles.actions;
export default processFiles.reducer;
