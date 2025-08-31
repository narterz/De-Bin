import { useAppDispatch } from "../lib/hooks";
import { removeFile } from "../lib/reducers/processFiles";
import { Trash, File, MoveRight } from "lucide-react";
import { UploadedFile } from "../utils/types";
import { shortenFileName, getFileExtension, convertFileSize } from "../utils/fileValidation";
import FileTypeCombobox from "./FileTypeCombobox";
import { Button } from "@/components/ui/button";

export default function SelectedFiles({ file }: { file: UploadedFile }) {
    const dispatch = useAppDispatch();

    const handleExpandFileName = (file: UploadedFile['fileName']): void => {

    }

    return (
        <div className="w-full h-full flex flex-row border rounded shadow-lg bg-foreground text-white" id="selected-file">
            <div className="flex-center-between selected-file-section">
                <Button className="icon-btn" onClick={() => handleExpandFileName(file.fileName)}>
                    <File className="selected-file-icons" />
                </Button>
                <p>{shortenFileName(file.fileName)}</p>
            </div>

            <div className="flex-center-between h-full w-1/5 border-l border-r border-black p-2">
                <p>{getFileExtension(file)}</p>
                <MoveRight className="selected-file-icons" />

                <FileTypeCombobox />
            </div>

            <div className="flex-center-between selected-file-section">
                <p>{convertFileSize(file.fileSize)}</p>
                <Button className="icon-btn" onClick={() => dispatch(removeFile(file.fileName))}>
                    <Trash className="selected-file-icons cursor-pointer"/>
                </Button>
            </div>
        </div>
    )
}