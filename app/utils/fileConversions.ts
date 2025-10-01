import { FileConversion, FileMetadata, FileState } from "./types";
import { jsPDF } from "jspdf";

// Return type is output of various conversion functions
export default async function handleFileConversion(file: FileState){
    console.debug("handleFileConversion called. Routing user to conversion function")
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

async function convertToPdf(file: FileState){
    const capitalizedFileExtension = typeof file.metadata.fileExtension === "string"
        ? file.metadata.fileExtension.slice(1).toUpperCase()
        : "";
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
        const pdf = new jsPDF();
    
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
    
        pdf.addImage(file.metadata.file, capitalizedFileExtension, 0, 0, pageWidth, pageHeight)
        pdf.save(`${file.metadata.fileName.split(".")[0]}.pdf`);
    }

    reader.onerror= (event: ProgressEvent<FileReader>) => {
        console.error(`Error reading ${file.metadata.fileExtension} file: ${file.metadata.fileName}`)
    }

    // Read file as base64

    const excelToPDF = () => {
        const excelFile = file.metadata.fileExtension === '.xlsb' ? decompressXlsb(file.metadata) : file 

    }
    
    
}

function decompressXlsb(file: FileMetadata){

}

const convertToCsv = (file: FileState) => {

}

const convertToExcel = (file: FileState) => {

}

const convertToPng = (file: FileState) => {

}

const convertToJpg = (file: FileState) => {

}

const convertToDocx = (file: FileState) => {

}

const compressFile = (file: FileState) => {

}