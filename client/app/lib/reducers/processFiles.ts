import { createSlice, PayloadAction, createAsyncThunk, } from '@reduxjs/toolkit';
import  handleFileConversion  from "../../utils/fileConversions";
import { v4 as uuidv4 } from 'uuid';
import { FileState, FilesState, FileMetadata, FileConversion, AcceptedFilTypes, FileStatus } from '@/app/utils/types';
import { validateSelectedFile, shortenFileName, getFileExtension, getFileConversions, convertFileSize } from '@/app/utils/fileValidation';
import axios, { AxiosPromise } from 'axios';

const initialState: FilesState = {
    files: [],
}

export const convertFile = createAsyncThunk(
    'deBin/convertFile',
    async (file: FileState, thunkAPI) => {
        const response = await handleFileConversion(file)
        return response;
    }
)

export const uploadFileToBackend = createAsyncThunk(
    'api/upload',
    async (file: FileState) => {
        const formData = new FormData();
        formData.append('file', file.metadata.file);
        formData.append('id', file.metadata.id || '');
        formData.append('file_name', file.metadata.fileName);
        try {
            console.log(`Notifying backend to upload ${file.metadata.fileNameShortened} to /tmp`)
            const response = await axios.post<FileStatus>('/api/upload', formData);
            const newStatus = response.data;
            console.log(`Status of file ${file.metadata.fileNameShortened} is ${newStatus.status}`)
            updateFile({
                metadata: file.metadata,
                fileStatus: newStatus,
                fileConversions: file.fileConversions
            });
        } catch (err) {
            const errorMessage = "Failed to save file in backend with error: "
            const updatedFileState: FileState = {
                metadata: file.metadata,
                fileConversions: file.fileConversions,
                fileStatus: { status: "failure", error: errorMessage }
            }
            console.error(errorMessage + err)
            updateFile(updatedFileState)
        }
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
            
            // If we fail validations just update our status and return
            const fileStatus: FileStatus = validateSelectedFile({ file, fileName, fileSize, fileType });
            if(fileStatus.status === 'failure'){
                updateFile({
                    metadata: metadata,
                    fileStatus: fileStatus,
                    fileConversions: { conversion: '.zip', conversionList: [] }
                })
                return
            }

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
        },
        updateFile: (state, action: PayloadAction<FileState>) => {
            const targetedFile = state.files.findIndex(file => file.metadata.id === action.payload.metadata.id);
            if (targetedFile !== -1){
                state.files[targetedFile] = action.payload
            }
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

export const { uploadFile, removeFile, clearAllFiles, updateFile } = processFiles.actions;
export default processFiles.reducer;
