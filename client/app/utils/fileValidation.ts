import { AcceptedFilTypes, FileConversion, FileStatus, FileMetadata, FileState,} from "./types";
import mime from "mime-types";

// Serializes a file as base64 string to satisfy redux serialization standards
export const serializeFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file)
    })
}

export const shortenFileName = (file: string): string => {
    const fileNameShort = file.substring(0, 13);
    return `${fileNameShort}...`;
};

export const getFileExtension = (fileType: FileMetadata['fileType']): string | false => {
    return mime.extension(fileType);
};

export const convertFileSize = (fileSize: FileMetadata["fileSize"]) => {
    const intFileSize = fileSize as number;
    const conversionKb = intFileSize / 1024;
    const conversionMb = intFileSize / (1024 * 1024);
    const finalConversion =
        conversionKb >= 1000
            ? `${conversionMb.toFixed(2)}.mb`
            : `${conversionKb.toFixed(2)}.kb`;
    return finalConversion;
};

export const getFileConversions = (fileExtension: AcceptedFilTypes | undefined): FileConversion => {
    const conversionList: AcceptedFilTypes[] = [ ".pdf", ".csv", ".jpg", ".png", ".zip", ".xlsb",  ".xlsx" ];
    if (fileExtension === ".xlsx") {
        return {
            conversionList: [...conversionList, ".xlsb"],
            conversion: ".xlsb",
        };
    }
    if (fileExtension === ".xlsb") {
        return {
            conversionList: [...conversionList, ".xlsx"],
            conversion: ".xlsx",
        };
    }
    if (fileExtension && conversionList.includes(fileExtension)) {
        // Pick the first available conversion as default, or ".zip" if none
        const filteredList = conversionList.filter(ext => ext !== fileExtension);
        return {
            conversionList: filteredList,
            conversion: filteredList[0] || ".zip",
        };
    }
    return {
        conversionList,
        conversion: ".zip"
    };
}

export function validateDuplicateFile(selectedFile: FileMetadata, presentFiles: FileState[]): FileStatus {
    // Find a file in fileState[] with matching fileName and fileSize
    const isDuplicate = presentFiles.some(
        (file) =>
            file.metadata.fileName === selectedFile.fileName &&
            file.metadata.fileSize === selectedFile.fileSize
    )
    if (isDuplicate) {
        console.error(`validateDuplicateFile: File ${selectedFile.fileName} has already been selected`)
    } else {
        console.debug("No duplicates detected")
    }

    return {
        status: isDuplicate ? "failure" : "idle",
        error: isDuplicate ? `Duplicate file: ${selectedFile.fileName}` : ''
    }
}

export function validateMetadata(file: FileMetadata): FileStatus {
    const MAX_FILE_SIZE_MB = 3;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    const acceptedFileTypes = [ ".pdf", ".csv", ".png", ".xlsx", ".xlsb", ".jpg", ".zip",];
    // validate the file size
    if (file.fileSize as number > MAX_FILE_SIZE_BYTES) {
        console.error(`validateSelectedFile: File ${file.fileName} file size of ${file.fileSize} exceeds the max file size.`)
        return {
            status: "failure",
            error: `${file.fileName} is too large. File size can be no more than 3mb`,
        };
    }
    // validate file extension
    if (file.fileExtension) {
        if (!acceptedFileTypes.includes(file.fileExtension)) {
            console.debug(file.fileExtension)
            return {
                status: "failure",
                error: `File has unsupported format ${file.fileExtension}`,
            };
        }
    }
    return {
        status: "idle",
        error: "",
    };
}
