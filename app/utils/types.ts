export type UploadedFile = {
    id?: string;
    file: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileNameShortened?: string;
    fileExtension?: string | false
    status?: "idle" | "loading" | "success" | "failure"; //idle: validated files, success: converted files
    error?: string;
};

export type FileConversion = {
    conversionList: AcceptedFilTypes[],
    conversion: AcceptedFilTypes
}

export type FileStatus = {
    status: "idle" | "loading" | "success" | "failure";
    error: string
}

export type AcceptedFilTypes = ".pdf" | ".csv" | ".png" | ".xlsx" | ".xlsb" | ".jpg" | ".zip"

export type AppState = {
    uploadedFiles: UploadedFile[];
    fileConversion: FileConversion
};

export type DialogState = {
    dialogIsOpen: boolean;
    dialogHeader?: string;
    dialogBody?: string;
    errorList?: string[];
};

export type SelectState = {
    selectIsOpen: boolean;
}

export type TooltipState = {
    tooltipIsOpen: boolean;
}

export type AppController = {
    dialogState: DialogState;
    selectState: SelectState;
    tooltipState: TooltipState;
};
