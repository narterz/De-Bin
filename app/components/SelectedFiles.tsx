import { Trash, File, MoveRight, X } from "lucide-react";
import { FileMetadata, FileState } from "../utils/types";
import FileTypeSelect from "./FileTypeSelect";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleTooltip } from "../lib/reducers/appController";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { appController } from "../lib/selectors";

export default function SelectedFiles(
    { file, onRemoveFile }: 
    { file: FileState, onRemoveFile: (id: FileMetadata['id']) => void }){
    const dispatch = useAppDispatch();
    const tooltipState = useAppSelector(appController).tooltipState;

    const handleTooltipHover = (open: any) => {
        if(!open) {
            console.debug(`SelectedFiles tooltip is ${tooltipState.tooltipIsOpen ? "opened" : "closed"}`)
            dispatch(toggleTooltip());
        }
    }

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
                            <TooltipTrigger className="bg-accent w-1/4 flex items-center justify-center h-1/2 rounded-lg">
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
                <FileTypeSelect />
            </div>

            <div className="selected-file-section w-1/3">
                <p>{file.metadata.fileSize}</p>
                <Button 
                    className="icon-btn selected-files-btn bg-accent" 
                    onClick={() => onRemoveFile(file.metadata.id)}>
                    <Trash className="selected-file-icons cursor-pointer"/>
                </Button>
            </div>
        </div>
    )
}