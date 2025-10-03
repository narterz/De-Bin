import { AcceptedFilTypes, FileConversion, FileStatus, FileMetadata,} from "./types";
import mime from "mime-types";

// Serializes a file as base64 string to satisfy redux serialization standards
export const serializeFile = async (file: File): Promise<string> =>
{
    const buffer = await file.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const shortenFileName = (file: string): string => {
    const fileNameShort = file.substring(0, 13);
    return `${fileNameShort}...`;
};

export const getFileExtension = (file: FileMetadata): string | false => {
    const extension = file.fileName.slice(file.fileName.lastIndexOf("."));
    if (extension) {
        return extension;
    } else {
        return mime.extension(file.fileType);
    }
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
    const conversionList: AcceptedFilTypes[] = [ ".pdf", ".csv", ".jpg", ".png", ".zip" ];
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

export function validateSelectedFile(file: FileMetadata): FileStatus {
    const MAX_FILE_SIZE_MB = 3;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    const acceptedFileTypes = [ ".pdf", ".csv", ".png", ".xlsx", "xlsb", ".jpg", ".zip",];
    // validate the file size
    if (file.fileSize as number > MAX_FILE_SIZE_BYTES) {
        return {
            status: "failure",
            error: `${file.fileName} is too large. File size can be no more than 3mb`,
        };
    }
    // validate file extension
    if (file.fileExtension) {
        if (!acceptedFileTypes.includes(file.fileExtension)) {
            return {
                status: "failure",
                error: `File has unsupported format ${file.fileExtension}`,
            };
        }
    }
    return {
        status: "loading",
        error: "",
    };
}
