import { DialogState, FileState } from "./types";

export const tooManyFilesDialog = (): DialogState => {
    console.debug("Opening tooManyFilesDialog")
    return {
        dialogName: "tooManyFilesDialog",
        dialogIsOpen: true,
        dialogHeader: 'Error: too many files',
        dialogBody: "De-bin only allows up to 3 files at a time. Please try again"
    }
}

export const loadingFilesDialog = (): DialogState => {
    console.debug("Opening loadingFilesDialog")
    return {
        dialogName: "loadingFilesDialog",
        dialogIsOpen: true,
        dialogHeader: "Please wait",
        dialogBody: "Processing your files"
    }
}

export const failedToUploadFile = (fileName: string | undefined): DialogState => {
    console.debug("Opening failedToUploadFile")
    return {
        dialogName: "failedToUploadFile",
        dialogIsOpen: true,
        dialogHeader: "Failed to upload file",
        dialogBody: `Failed to upload file ${fileName}`
    }
}

export const failureDialog = (fileState: FileState[]): DialogState => {
    console.debug("Opening failureDialog")
    const duplicateFile = fileState.find(file => file.fileStatus.error.includes("Duplicate file"));
    const errorBody = duplicateFile
        ?  duplicateFile.fileStatus.error
        : "Following files cannot be processed"
    return {
        dialogName: "failureDialog",
        dialogIsOpen: true,
        dialogHeader: "Error: Failed to processes file(s)",
        dialogBody: errorBody,
        errorList: fileState
            .map(file => file.metadata.fileName)
            .filter((name): name is string => typeof name === "string")
    }
}

export const majorFailureDialog = (): DialogState => { 
    console.debug("Opening majorFailureDialog")
    return {
        dialogName: "majorFailureDialog",
        dialogIsOpen: true,
        dialogHeader: "Internal Server Error",
        dialogBody: "An error has occurred. Please refresh the application"
    }
}