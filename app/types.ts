export type UploadedFile = {
    file: File;
    fileName: string;
    fileSize: number;
    fileType: string;
}

export type AcceptedFiles = ".zip" | ".tar" | ".xlsx" | "gzip" | ".7z" | ".rar" | ".tar.gz" | ".tar.bz2" | ".tar.xz";

type DecompressedFile = {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileContent: string;
}

type DecompressionStatus = {
    status: "idle" | "decompressing" | "completed" | "error";
    error?: string;
}

type DecompressionResult = {
    decompressedFiles: DecompressedFile[];
    totalFiles: number;
}

type DecompressionError = {
    message: string;
    code?: number;
}

export type AppState = {
    uploadedFiles: UploadedFile[];
    decompressedFiles: DecompressedFile[];
    decompressionStatus: DecompressionStatus;
    decompressionResult: DecompressionResult | null;
    error: DecompressionError | null;
    isLoading: boolean;
}