import { useAppDispatch } from "../lib/hooks";
import { removeFile } from "../lib/reducers/processFiles";
import { IoDocumentOutline } from "react-icons/io5";
import { FaLongArrowAltRight } from "react-icons/fa";
import { Trash } from "lucide-react";
import { UploadedFile } from "../utils/types";
import { shortenFileName, getFileExtension } from "../utils/fileValidation";
import FileTypeCombobox from "./FileTypeCombobox";

export default function SelectedFiles({ file }: { file: UploadedFile }) {
    const dispatch = useAppDispatch();

    return (
        <div className="w-full h-full flex flex-col border-rounded shadow-lg bg-primary text-white">
            <div>
                <div className="w-1/3 h-hull flex flex-row items-center justify-between me-3">
                    <IoDocumentOutline />
                    <p>{shortenFileName(file.fileName)}</p>
                </div>

                <div className="h-full w-1/5 flex flex-row justify-between items-center">
                    <p>{getFileExtension(file)}</p>
                    <FaLongArrowAltRight />
                    <FileTypeCombobox />
                </div>

                <div className="w-1/3 h-hull flex flex-row items-center justify-between ms-3">
                    <p>{file.fileSize}</p>
                    <Trash onClick={() => dispatch(removeFile(file.fileName))}/>
                </div>
            </div>
        </div>
    )
}