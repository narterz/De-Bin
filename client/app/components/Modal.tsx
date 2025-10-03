"use client";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MdCancel } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { closeDialog, openDialog } from "../lib/reducers/appController";
import { appController, processFile } from "../lib/selectors";
import { useEffect, useState } from "react";

export default function Modal() {
    const [somePending, setSomePending] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const dialogState = useAppSelector(appController).dialogState;
    const files = useAppSelector(processFile).uploadedFiles;
    const dialogController = useAppSelector(appController).dialogState;

    const handleCloseDialog = (open: any) => {
        if (!open) {
            console.debug("Closing dialog");
            dispatch(closeDialog());
        }
    };

    useEffect(() => {
        const pendingFiles = files.some((file) => file.status === "loading");
        const failedFiles = files.filter((file) => file.status === "failure");
        if (pendingFiles) {
            console.debug(`Files are pending opening pending dialog`);
            setSomePending(true)
            dispatch(
                openDialog({
                    header: "Processing files",
                    body: "Please wait while your files are being converted",
                })
            );
        } else if (failedFiles.length > 0) {
            console.debug(`Opening failure modal. The following files failed ${failedFiles}`)
            dispatch(closeDialog());
            setSomePending(false)
            dispatch(
                openDialog({
                    header: "The following errors occurs",
                    body: `Failed to process file(s): ${failedFiles} please try again`,
                })
            );
        }
    }, [files]);

    useEffect(() => {
        if (dialogController) {
            setTimeout(() => {
                dispatch(closeDialog());
            }, 8000);
        }
    }, [dialogController.dialogIsOpen]);

    return (
        <Dialog
            open={dialogState.dialogIsOpen}
            onOpenChange={(open) => handleCloseDialog(open)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogState.dialogHeader}</DialogTitle>
                    <DialogClose asChild>
                        <MdCancel className="icon hover-text" />
                    </DialogClose>
                </DialogHeader>

                <DialogDescription>
                    <span>{dialogState.dialogBody}</span>
                    <ul className="w-full h-2/3 flex flex-col items-center justify-evenly">
                        {dialogController.errorList?.map((message, i) => (
                            <li key={`message-${i}`}>{message[i]}</li>
                        ))}
                    </ul>
                </DialogDescription>

                <DialogFooter>
                    <Button
                        onClick={() => dispatch(closeDialog())}
                        className={`${!somePending ? '' : 'hidden'}`}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
