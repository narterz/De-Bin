import { NavigationBtnContent } from "../utils/types";

export const helpBtnContent: NavigationBtnContent[] = [
    {
        title: "Select your file(s)",
        description:
            "Drag your file into the large blue box or click the choose file button to select files. Once your file has been added, choose your file conversion type and press convert file. After a successful conversion, the file can be downloaded.",
    },
    {
        title: "Limitations",
        description:
            "You can upload and converted up to three files at a time. Each file can be no large than 3MB",
    },
    {
        title: "Acceptable files",
        description:
            "There are 20 file conversion possibilities in De-Bin. Accepted files include pdf, csv, jpg, png, xlsx, xlsb, txt, and zip",
    },
];

export const communityBtn: NavigationBtnContent[] = [
    {
        title: "View on Github",
        description: "This project is open source! Click the Github logo on the bottom right to view the source code",
    },
    {
        title: "Feedback & Contribution",
        description: "Your feedback is appreciated! If you want to suggest any fixes or new features message me on github or @ jaydenshelton@yahoo.com",
    },
    {
        title: "Share the app",
        description: "Loving De-Bin so far? Make sure to share the app with your friends. Spread the word!",
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
