export type UploadedFile = {
    id: string;
    file: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    status: "idle" | "loading" | "success" | "failure";
    error?: string;
};

export type FileConversion = {
    conversionList: AcceptedFilTypes[],
    conversion: AcceptedFilTypes | ''
}

export type UpdateFile = {
    id: string,
    status: "idle" | "loading" | "success" | "failure";
    error?: string
}

export type AcceptedFilTypes = ".pdf" | ".csv" | ".png" | ".xlsx" | "xlsb" | ".jpg" 

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

export type AppController = {
    dialogState: DialogState;
    selectState: SelectState
};
