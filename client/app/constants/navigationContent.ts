import { NavigationBtnContent } from "../utils/types";

export const helpBtnContent: NavigationBtnContent[] = [
    {
        title: "Select your file(s)",
        description:
            "Drag your file into the large blue box or click the choose file button to select files.",
    },
    {
        title: "Limitations",
        description:
            "You can upload up to three compressed files at once, each no larger than 3MB.",
    },
    {
        title: "Download your files",
        description:
            "After uploading, press 'de-bin' to download the converted files.",
    },
];

export const toolsBtnContent: NavigationBtnContent[] = [
    {
        title: "Excel Decompression",
        description: "Converts XLSB files to XLSX format.",
    },
    {
        title: "Zip Decompression",
        description: "Decompress a standard ZIP archive.",
    },
    {
        title: "Gzip Decompression",
        description: "Decompress single .gz files.",
    },
];

export const sampleBtnContent: NavigationBtnContent[] = [
    {
        title: "Sample xlsx document",
        description:
            "Download sample xlsx file and drag it to drop box to test conversions",
        file: "XLSX",
    },
    {
        title: "Sample xlsb document",
        description:
            "Download sample xlsb file and drag it to drop box to test conversions",
        file: "XLSB",
    },
    {
        title: "Sample pdf document",
        description:
            "Download sample pdf file and drag it to drop box to test conversions",
        file: "PDF",
    },
    {
        title: "Sample txt document",
        description:
            "Download sample txt file and drag it to drop box to test conversions",
        file: "TXT",
    },
    {
        title: "Sample csv document",
        description:
            "Download sample csv file and drag it to drop box to test conversions",
        file: "CSV",
    },
    {
        title: "Sample jpg document",
        description: "Download sample jpg file and drag it to drop box to test conversions",
        file: "JPG"
    }
];
