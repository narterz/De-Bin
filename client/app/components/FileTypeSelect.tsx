import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";

import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { appController, processFile } from "../lib/selectors";
import { toggleSelect } from "../lib/reducers/appController";
import { AcceptedFilTypes } from "../utils/types";

//TODO: Change color of placeholder text and icon carrot

export default function FileTypeSelect(){
    const dispatch = useAppDispatch();
    const selectState = useAppSelector(appController).selectState;
    const fileState = useAppSelector(processFile).fileConversion;

    const handleToggleSelect = (open:any) => {
        if(!open) {
            console.debug(`Select is now ${selectState.selectIsOpen ? 'opened' : 'closed'}`)
            dispatch(toggleSelect())
        }
    }

    const handleSelection = (selection: AcceptedFilTypes) => {
        console.debug(`Closing select with selected file type ${selection}`)
        // dispatch(setFileConversion(selection))
        dispatch(toggleSelect())
    }

    return (
        <Select onValueChange={handleSelection} onOpenChange={handleToggleSelect} >
            <SelectTrigger className="bg-accent text-white border-none flex items-center justify-end w-1/2">
                <SelectValue placeholder={fileState.conversion} className="text-black placeholder-text-black"/>
            </SelectTrigger>
            <SelectContent className="text-black bg-white">
                <SelectGroup>
                    {fileState.conversionList.map((type: AcceptedFilTypes) => (
                        <SelectItem key={type} value={type}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}