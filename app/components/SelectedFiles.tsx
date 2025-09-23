import { useAppDispatch } from "../lib/hooks";
import { removeFile } from "../lib/reducers/processFiles";
import { Trash, File, MoveRight } from "lucide-react";
import { UploadedFile } from "../utils/types";
import { shortenFileName, getFileExtension, convertFileSize } from "../utils/fileValidation";
import FileTypeSelect from "./FileTypeSelect";
import { Button } from "@/components/ui/button";

export default function SelectedFiles(
    { file, onRemoveFile }: 
    { file: UploadedFile, onRemoveFile: (fileName: UploadedFile['fileName']) => void }){
    const dispatch = useAppDispatch();

    const handleExpandFileName = (file: UploadedFile['fileName']): void => {

    }

    return (
        <div className="selected-files w-full h-1/4 flex flex-row border rounded shadow-lg bg-accent text-black border border-black">

            <div className="selected-file-section w-1/3">
                <Button className="icon-btn" onClick={() => handleExpandFileName(file.fileName)}>
                    <File className="selected-file-icons" />
                </Button>
                <p>{shortenFileName(file.fileName)}</p>
            </div>

            <div className="selected-file-section w-1/3 border-l border-r border-black p-2">
                <p>{getFileExtension(file)}</p>
                <MoveRight className="text-black" />
                <FileTypeSelect />
            </div>

            <div className="selected-file-section w-1/4">
                <p>{convertFileSize(file.fileSize)}</p>
                <Button 
                    className="icon-btn" 
                    onClick={() => onRemoveFile(file.fileName)}>
                    <Trash className="selected-file-icons cursor-pointer"/>
                </Button>
            </div>
        </div>
    )
}