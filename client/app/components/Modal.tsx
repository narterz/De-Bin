"use client";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { closeDialog, openDialog } from "../lib/reducers/appController";
import { appController, processFile } from "../lib/selectors";
import { useEffect } from "react";
import { loadingFilesDialog, failureDialog, majorFailureDialog } from "../utils/dialogContent";

export default function Modal() {
    const dispatch = useAppDispatch();
    const dialogState = useAppSelector(appController).dialogState;
    const files = useAppSelector(processFile).files;
    const dialogController = useAppSelector(appController).dialogState;
    const majorFailure = useAppSelector(appController).isMajorFailure;

    const handleCloseDialog = (open: any) => {
        if (!open) {
            console.debug("Closing dialog");
            dispatch(closeDialog());
        }
    };

    useEffect(() => {
        const pendingFiles = files.filter((file) => file.fileStatus.status === "loading");
        const failedFiles = files.filter((file) => file.fileStatus.status === "failure");

        if (pendingFiles.length > 0) {
            console.debug(`Modal.tsx: ${pendingFiles.length} pending files detected`);
            dispatch(openDialog(loadingFilesDialog()))
        }
        
        else if (failedFiles.length > 0) {
            console.debug(`Modal.tsx: ${failedFiles.length} files detected`)
            dispatch(closeDialog());
            dispatch(openDialog(failureDialog(failedFiles)))
        }
        
        console.debug("Major failure is: " + majorFailure)
    }, [files]);

    useEffect(() => {
        if (dialogController.dialogIsOpen) {
            setTimeout(() => {
                console.debug(`Closing ${dialogController.dialogName}`)
                dispatch(closeDialog());
            },
                dialogController.dialogName === 'loadingFilesDialog' ? 2000 : 5000
            );
        }
    }, [dialogController.dialogIsOpen]);

    useEffect(() => {
        if (majorFailure) dispatch(openDialog(majorFailureDialog()))
    },[majorFailure])

    return (
        <Dialog open={dialogState.dialogIsOpen} onOpenChange={(open) => handleCloseDialog(open)}>
            <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            <DialogContent>
                
                <DialogHeader>
                    <DialogTitle>{dialogState.dialogHeader}</DialogTitle>
                    <DialogClose asChild>
                    </DialogClose>
                </DialogHeader>

                <DialogDescription>
                    <span>{dialogState.dialogBody}</span>
                    <span className="w-full h-2/3 flex flex-col items-center justify-evenly">
                        {dialogController.errorList?.map((message, i) => (
                            <span key={`message-${i}`}>{message}</span>
                        ))}
                    </span>
                </DialogDescription>

                <DialogFooter>
                    <Button onClick={() => dispatch(closeDialog())} className={`${dialogController.dialogName === 'loadingFilesDialog' ? '' : 'hidden'}`}>
                        Close
                    </Button>
                    <Button onClick={() => location.reload()} className={`${dialogController.dialogName === 'majorFailureDialog' ? '' : "hidden"}`}>
                        Refresh page
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
