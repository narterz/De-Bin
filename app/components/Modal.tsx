"use client";

import { 
    Dialog, 
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MdCancel } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { closeDialog } from "../lib/reducers/appController";
import { appController } from "../lib/selectors";


export default function Modal(){
    const dispatch = useAppDispatch();
    const dialogState = useAppSelector(appController).dialogState;

    const handleCloseDialog = (open:any) => {
        if(!open) {
            console.debug("Closing dialog");
            dispatch(closeDialog());
        }
    }

    return (
        <Dialog open={dialogState.dialogIsOpen} onOpenChange={(open) => handleCloseDialog(open)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogState.dialogHeader}</DialogTitle>
                    <DialogClose asChild>
                        <MdCancel className="icon hover-text" />
                    </DialogClose>
                </DialogHeader>

                <DialogDescription>
                    <span>{dialogState.dialogBody}</span>
                </DialogDescription>

                <DialogFooter>
                    <Button onClick={() => dispatch(closeDialog())}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}