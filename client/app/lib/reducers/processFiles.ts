import { createSlice, PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import  handleFileConversion  from "../../utils/fileConversions";
import { v4 as uuidv4 } from 'uuid';
import { FileState, FilesState, FileMetadata, FileConversion, AcceptedFilTypes, FileStatus } from '@/app/utils/types';
import { validateSelectedFile, shortenFileName, getFileExtension, getFileConversions, convertFileSize } from '@/app/utils/fileValidation';

const initialState: FilesState = {
    files: [],
}

export const convertFile = createAsyncThunk(
    'deBin/convertFile',
    async (
        file: FileState, 
        thunkAPI
    ) => {
        const response = await handleFileConversion(file)
        return response;
    }
)

const processFiles = createSlice({
    name: 'processFiles',
    initialState,
    reducers: {
        uploadFile: (state, action: PayloadAction<FileMetadata>) => {
            const { file, fileName, fileSize, fileType } = action.payload;
            const metadata: FileMetadata = {
                id: uuidv4(),
                file: file,
                fileName: fileName,
                fileSize: convertFileSize(fileSize),
                fileType: fileType,
                fileNameShortened: shortenFileName(fileName),
                fileExtension: getFileExtension(action.payload)
            }
            
            const fileStatus:FileStatus = validateSelectedFile({file, fileName, fileSize, fileType});

            let fileConversions: FileConversion = { conversion: '.zip', conversionList: [] };
            if (metadata.fileExtension) {
                const conversionResult = getFileConversions(metadata.fileExtension as AcceptedFilTypes);
                if (conversionResult) {
                    fileConversions = conversionResult;
                }
            }

            state.files.push({ metadata, fileStatus, fileConversions  });
        },
        removeFile: (state, action: PayloadAction<FileMetadata['id']>) => {
            const index = state.files.findIndex(file => file.metadata.id === action.payload)
            if (index !== -1) {
                state.files.splice(index, 1);
            }
        },
        clearAllFiles: (state) => {
            state.files = initialState.files; 
        }
    },
    extraReducers: (builder) => {
        builder.addCase(convertFile.pending, (state) => {
            
        }),
        builder.addCase(convertFile.fulfilled, (state) => {

        }),
        builder.addCase(convertFile.rejected, (state) => {

        })
    }
})

export const { uploadFile, removeFile, clearAllFiles } = processFiles.actions;
export default processFiles.reducer;
