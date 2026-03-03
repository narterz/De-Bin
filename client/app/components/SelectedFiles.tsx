import { Trash, File, MoveRight, X, Download } from "lucide-react";
import { FileMetadata, FileState } from "../utils/types";
import FileTypeSelect from "./FileTypeSelect";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleTooltip } from "../lib/reducers/appController";
import { downloadFile } from "../lib/reducers/processFiles";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { appController } from "../lib/selectors";
import { useEffect, useState } from "react";
import { getFileSizeValue } from "../utils/fileValidation";

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

    const handleDownloadFile = async () => {
        console.debug(`[handleDownloadFile] initiating download via downloadFile()`);
        await dispatch(downloadFile(file))
    }


    useEffect(() => {
        setOriginalFormat(file.metadata.fileExtension)
    }, [])
    
    // If a files extension has changed, then it was converted and can now be downloaded
    useEffect(() => {
        if(file.fileStatus.status === 'success') {
            setIsDownloadable(true)
        }
    },[file])

    return (
        <div className="selected-files h-1/4 flex flex-row border rounded shadow-lg bg-foreground text-black border-black">

            <div className="selected-file-section w-1/3" id="title">
                <Tooltip onOpenChange={handleTooltipHover}>
                    { file.fileStatus.error 
                        ? <>
                            <TooltipTrigger className="selected-file-tooltip bg-error flex-center">
                                <X className="selected-file-icons bg-error"/>
                            </TooltipTrigger>
                            <TooltipContent className="text-black">{`${file.fileStatus.status}: ${file.fileStatus.error}`}</TooltipContent>
                        </>

                        : <>
                            <TooltipTrigger className={`${file.fileStatus.status === "success" ? "bg-green-400" : "bg-accent"} selected-file-tooltip flex-center`}>
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
                <p>{getFileSizeValue(file.metadata.fileSize)}</p>
                <Button 
                    className="icon-btn selected-files-btn bg-accent" 
                    onClick={() => onRemoveFile(file)}>
                    <Trash className="selected-file-icons"/>
                </Button>
                <Button
                    className={isDownloadable ? "icon-btn selected-files-btn bg-accent" : "hidden"}
                    onClick={() => handleDownloadFile()}
                >
                    <Download className="selected-file-icons"/>
                </Button>
            </div>
        </div>
    )
}