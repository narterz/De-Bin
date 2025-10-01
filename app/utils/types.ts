export interface FileState {
    metadata: FileMetadata;
    fileStatus: FileStatus
    fileConversions?: FileConversion
};

export interface FilesState {
    files: FileState[];
};

export type FileConversion = {
    conversionList: AcceptedFilTypes[];
    conversion: AcceptedFilTypes;
};

export type FileStatus = {
    status: "idle" | "loading" | "success" | "failure";
    error: string;
};

export type FileMetadata = {
    id?: string;
    file: string;
    fileName: string;
    fileSize: number | string;
    fileType: string;
    fileNameShortened?: string;
    fileExtension?: string | false;
}

export type AcceptedFilTypes =
    | ".pdf"
    | ".csv"
    | ".png"
    | ".xlsx"
    | ".xlsb"
    | ".jpg"
    | ".zip"
    | ".jpeg";

export type DialogState = {
    dialogIsOpen: boolean;
    dialogHeader?: string;
    dialogBody?: string;
    errorList?: string[];
};

export type SelectState = {
    selectIsOpen: boolean;
};

export type TooltipState = {
    tooltipIsOpen: boolean;
};

export type AppController = {
    dialogState: DialogState;
    selectState: SelectState;
    tooltipState: TooltipState;
};
