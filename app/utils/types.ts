export type UploadedFile = {
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

export type AcceptedFilTypes = ".pdf" | ".csv" | ".png" | ".xlsx" | "xlsb" | ".jpg" 

export type AppState = {
    uploadedFiles: UploadedFile[];
    fileConversion: FileConversion
};

export type ValidateFiles = {
    isValid: boolean;
    message?: string | null;
};

export type DialogState = {
    dialogIsOpen: boolean;
    dialogHeader?: string;
    dialogBody?: string;
};

export type ComboBoxState = {
    comboboxIsOpen: boolean;
    selectedType: string;
}

export type AppController = {
    dialogState: DialogState;
    comboboxState: ComboBoxState
};
