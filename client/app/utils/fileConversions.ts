import { FileConversion, FileMetadata, FileState, FileStatus } from "./types";
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';
import { getFileExtension } from "./fileValidation";

export default async function handleFileConversion(file: FileState): Promise<FileState> {
    console.debug("handleFileConversion called. Routing user to conversion function")
    let chosenFile = file;
    if(chosenFile.metadata.fileExtension === '.xlsb' && chosenFile.fileConversions?.conversion !== '.xlsx'){
        chosenFile = await decompressXlsb(file)
    }
    switch(file.fileConversions?.conversion){
        case ".pdf":
            const pdfConversion = await convertToPdf(file);
            return pdfConversion
        case ".jpg":
            return convertToJpg(file)
        case ".xlsb":
            return convertToExcel(file)
        case ".xlsx":
            return convertToExcel(file)
        case ".png":
            return convertToPng(file)
        case ".csv":
            return convertToCsv(file)
        default:
            return compressFile(file)
    }
}

const conversionFailureResponse = (file: FileState): FileState => {
    return {
        ...file,
        fileStatus: {
            status: "failure",
            error: `${file.fileConversions?.conversion} conversion failed`
        }
    }
}

const conversionSuccessResponse = (newMetadata: FileMetadata, file: FileState): FileState => {
    return {
        metadata: newMetadata,
        fileStatus: {
            status: "success",
            error: ""
        },
        fileConversions: file.fileConversions
    }
}

async function convertToPdf(file: FileState): Promise<FileState> {
    return new Promise((resolve, reject) => {
        try {
            const capitalizedFileExtension = typeof file.metadata.fileExtension === "string"
                ? file.metadata.fileExtension.slice(1).toUpperCase()
                : "";
            
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(file.metadata.file, capitalizedFileExtension, 0, 0, pageWidth, pageHeight);
            
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Create new FileState with converted PDF data
            const newMetadata: FileMetadata = {
                ...file.metadata,
                file: pdfUrl, // Store the blob URL
                fileName: `${file.metadata.fileName.split(".")[0]}.pdf`,
                fileType: "application/pdf",
                fileExtension: ".pdf",
                fileSize: pdfBlob.size
            }
            const newFileState = conversionSuccessResponse(newMetadata, file)
            resolve(newFileState);
        } catch (error) {
            console.error(error)
            reject(conversionFailureResponse(file))
        }
    });
}

async function decompressXlsb(file: FileState): Promise<FileState>{
    return new Promise((resolve, reject) => {
        try {
            const newExcelFileName = `${file.metadata.fileName.split("."[0])}.xlsx`
            const compressedExcel:XLSX.WorkBook = XLSX.read(file.metadata.file, { type: "binary" });
            // const decompressedExcel:string =  XLSX.writeFile(compressedExcel, newExcelFileName, { type: "string" });

            //Send decompressedFile back to thunk to make set its metadata

        } catch (err) {
            console.error(err);
            reject(conversionFailureResponse(file))
        }
    })
}

async function convertToCsv(file: FileState): Promise<FileState> {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                
            }

        } catch (err) {
            console.error(err);
            reject(conversionFailureResponse(file))
        }
    })
}

const convertToExcel = (file: FileState): FileState => {
    // TODO: Implement Excel conversion
    return {
        ...file,
        fileStatus: {
            status: "failure",
            error: "Excel conversion not yet implemented"
        }
    };
}

const convertToPng = (file: FileState): FileState => {
    // TODO: Implement PNG conversion
    return {
        ...file,
        fileStatus: {
            status: "failure",
            error: "PNG conversion not yet implemented"
        }
    };
}

const convertToJpg = (file: FileState): FileState => {
    // TODO: Implement JPG conversion
    return {
        ...file,
        fileStatus: {
            status: "failure",
            error: "JPG conversion not yet implemented"
        }
    };
}

const convertToDocx = (file: FileState): FileState => {
    // TODO: Implement DOCX conversion
    return {
        ...file,
        fileStatus: {
            status: "failure",
            error: "DOCX conversion not yet implemented"
        }
    };
}

const compressFile = (file: FileState): FileState => {
    // TODO: Implement file compression
    return {
        ...file,
        fileStatus: {
            status: "failure",
            error: "File compression not yet implemented"
        }
    };
}