import { Trash, File, MoveRight, X, Download } from "lucide-react";
import { FileMetadata, FileState } from "../utils/types";
import FileTypeSelect from "./FileTypeSelect";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleTooltip } from "../lib/reducers/appController";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { appController } from "../lib/selectors";
import { useEffect, useState } from "react";

export default function SelectedFiles(
    { file, onRemoveFile }: 
        { file: FileState, onRemoveFile: (file: FileState) => void }) {
    const dispatch = useAppDispatch();
    const tooltipState = useAppSelector(appController).tooltipState;
    const [originalFormat, setOriginalFormat] = useState<FileMetadata['fileExtension']>('');
    const [isDownloadable, setIsDownloadable] = useState<boolean>(false)

    const handleTooltipHover = (open: any) => {
        if(!open) {
            console.debug(`SelectedFiles tooltip is ${tooltipState.tooltipIsOpen ? "opened" : "closed"}`)
            dispatch(toggleTooltip());
        }
    }

    const handleDownloadFile = () => {

    }


    useEffect(() => {
        setOriginalFormat(file.metadata.fileExtension)
    }, [])
    
    // If a files extension has changed, then it was converted and can now be downloaded
    useEffect(() => {
        console.debug(`Status of ${file.metadata.fileName} changed to ${file.fileStatus.status}`)
        if (file.metadata.fileExtension !== originalFormat) {
            setIsDownloadable(true)
        }
    },[file])

    return (
        <div className="selected-files w-full h-1/4 flex flex-row border rounded shadow-lg bg-foreground text-black border border-black">

            <div className="selected-file-section w-1/3">
                <Tooltip onOpenChange={handleTooltipHover}>
                    { file.fileStatus.error 
                        ? <>
                            <TooltipTrigger className="bg-accent">
                                <X className="selected-file-icons bg-error"/>
                            </TooltipTrigger>
                            <TooltipContent className="text-black">{`${file.fileStatus.status}: ${file.fileStatus.error}`}</TooltipContent>
                        </>

                        : <>
                            <TooltipTrigger className={`${file.fileStatus.status === "success" ? "bg-green-400" : "bg-accent"} w-1/4 flex items-center justify-center h-1/2 rounded-lg`}>
                                <File className="selected-file-icons bg-success"/>
                            </TooltipTrigger>
                            <TooltipContent className="text-black">{file.metadata.fileName}</TooltipContent>
                            </>
                    }
                </Tooltip>
                <p>{file.metadata.fileNameShortened}</p>
            </div>

            <div className="selected-file-section w-1/3 border-l border-r border-black p-2">
                <p>{file.metadata.fileExtension}</p>
                <MoveRight className="text-black" />
                {file.fileConversions && (
                    <FileTypeSelect file={file} />
                )}
            </div>

            <div className="selected-file-section w-1/3">
                <p>{file.metadata.fileSize}</p>
                <Button 
                    className="icon-btn selected-files-btn bg-accent" 
                    onClick={() => onRemoveFile(file)}>
                    <Trash className="selected-file-icons cursor-pointer"/>
                </Button>
                <Button
                    className={`${isDownloadable} ? icon-btn selected-files-btn bg-accent : hidden`}
                    onClick={() => handleDownloadFile()}
                >
                    <Download className="selected-file-icons cursor-pointer"/>
                </Button>
            </div>
        </div>
    )
}