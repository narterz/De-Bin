import { ValidateFiles, AppState, UploadedFile } from "./types";

//TODO: Fix type error between File and uploadedFile

const errorTypes = [

]

// Serializes a file as base64 string to satisfy redux serialization standards
export const serializeFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const validateFileQuantity = (
    files: AppState["uploadedFiles"]
): ValidateFiles => {
    const allFiles = Array.from(files);
    if (allFiles.length > 3) {
        return {
            isValid: false,
            message: "You can only select up to three files at a time",
        };
    } else {
        return {
            isValid: true,
            message: "",
        };
    }
};

const validateFileSize = (file: UploadedFile["file"]): ValidateFiles => {
    const MAX_FILE_SIZE_MB = 3;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            isValid: false,
            message: `File ${file.name} is too large. file size can be no more than 3mb`,
        };
    } else {
        return {
            isValid: true,
            message: "",
        };
    }
};

const validateFileExtension = (file: File) => {
    const acceptedFileTypes = ["xlsb", ".gz", ".zip"];
    if (!acceptedFileTypes.includes(file.type)) {
        return {
            isValid: false,
            message: `File ${file.name} has unsupported extension ${file.type}.`,
        };
    } else {
        return {
            isValid: true,
            message: "",
        };
    }
};

// Validates N files uploaded. Returns bool and response message
export function validateSelectedFiles(files: AppState["uploadedFiles"]) {
    const allFiles = Array.from(files);
    const quantityCheck = validateFileQuantity(allFiles);
    const fileSizeCheck = allFiles.forEach((file) => {
        validateFileSize(file);
    });

    //Iterate each file to see if size is more than or equal to 3mb

    //Iterate each file to see if extension is not of type AcceptedFiles
}
