export type UploadedFile = {
    file: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    status: "idle" | "loading" | "success" | "failure";
    error?: string;
}

type AcceptedCompressedFiles = 'mp3' | 'jpeg' | 'gz' | 'zip' | 'xlsb' | "gzip"
type AcceptedUncompressedFiles = 'txt' | 'html' | 'csv' | 'docx' | 'xlsx'

export type AcceptedFiles = AcceptedCompressedFiles | AcceptedUncompressedFiles;

export type AppState = {
    uploadedFiles: UploadedFile[];
}

export type ValidateFiles = {
    isValid: boolean
    message?: string | null
}