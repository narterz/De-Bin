import { FileError, AppState, UploadedFile, AcceptedFilTypes, FileConversion } from "./types";
import mime from 'mime-types';

// ############### File mutations

// Serializes a file as base64 string to satisfy redux serialization standards
export const serializeFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const shortenFileName = (file: UploadedFile['fileName']): string => {
    const fileExtension = file.substring(file.lastIndexOf("."));
    const fileNameShort = file.substring(0, 13);
    return `${fileNameShort}... ${fileExtension}`;
};

export const getFileExtension = (file: UploadedFile): string | false => {
    const extension = file.fileName.slice(file.fileName.lastIndexOf('.'))
    if(extension){
        return extension
    } else {
        return mime.extension(file.fileType)
    }
}

export const convertFileSize = (fileSize: UploadedFile['fileSize']) => {
    const conversionKb = fileSize / 1024;
    const conversionMb = fileSize / ( 1024 * 1024)
    const finalConversion = conversionKb >= 1000 
        ? `${conversionMb}.mb` 
        :  `${conversionKb}.kb`
    return finalConversion
}

export const getFileConversions = (fileExtension: string) => {
    const conversionList:FileConversion['conversionList'] = [ ".pdf", ".csv", ".jpg", '.png' ];
    const chosenFileExtension = fileExtension as AcceptedFilTypes;
    if(fileExtension === 'xlsx'){
        return {
            conversionList: conversionList + 'xlsb',
            conversion: 'xlsb'
        }
    } else if (fileExtension === 'xlsb'){
        return {
            conversionList: conversionList + 'xlsx',
            conversion: 'xlsx'
        }
    } else if (conversionList.includes(chosenFileExtension)){
        return {
            conversionList: conversionList.slice(conversionList.indexOf(chosenFileExtension), 1),
            conversion: ''
        }
    }
}

// ############### File validations

const validateFileQuantity = (files: AppState["uploadedFiles"]): FileError | boolean => {
    const allFiles = Array.from(files);
    if (allFiles.length > 3) {
        return {
            isValid: false,
            message: "You can only select up to three files at a time",
        };
    } else {
        return true
    }
};

const validateFileSize = (file: UploadedFile): FileError | boolean => {
    const MAX_FILE_SIZE_MB = 3;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.fileSize > MAX_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            message: `File ${file.fileName} is too large. file size can be no more than 3mb`,
        };
    } else {
        return true
    }
};

const validateFileExtension = (file: UploadedFile): FileError | boolean => {
    const acceptedFileTypes = [".pdf" , ".csv" , ".png" , ".xlsx" , "xlsb" , ".jpg"];
    if (!acceptedFileTypes.includes(file.fileType)) {
        return {
            isValid: false,
            message: `File ${file.fileName} has unsupported extension ${file.fileName}.`,
        };
    } else {
        return true;
    }
};

// Validates N files uploaded. Returns bool and response message
export function validateSelectedFiles(files: UploadedFile[]): FileError | boolean {
    const individualFileValidations = files.map((file) => [
        validateFileSize(file),
        validateFileExtension(file)
    ]).flat();
    const quantityCheck = validateFileQuantity(files);
    if(quantityCheck !== true) return quantityCheck;
    const firstError = individualFileValidations.find((validation: any) => validation !== true);
    if (firstError) return firstError;

    return true
}
