import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";

import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { appController } from "../lib/selectors";
import { toggleSelect } from "../lib/reducers/appController";
import { updateFileConversion } from "../lib/reducers/processFiles";
import { AcceptedFilTypes, FileState } from "../utils/types";
import { v4 as uuidv4 } from 'uuid';

//TODO: Change color of placeholder text and icon carrot

export default function FileTypeSelect({ file }: { file: FileState }){
    const dispatch = useAppDispatch();
    const selectState = useAppSelector(appController).selectState;

    const conversion = file.fileConversions?.conversion;
    const conversionList = file.fileConversions?.conversionList

    const handleToggleSelect = (open:any) => {
        if(!open) {
            console.debug(`Select is now ${selectState.selectIsOpen ? 'opened' : 'closed'}`)
            dispatch(toggleSelect())
        }
    }

    const handleSelection = (selection: AcceptedFilTypes) => {
        console.debug(`Closing select with selected file type ${selection}`)
        let newFileState: FileState = structuredClone(file);
        if (newFileState.fileConversions?.conversion) {
            newFileState.fileConversions.conversion = selection
            dispatch(updateFileConversion(newFileState))
        }
        dispatch(toggleSelect())
    }

    return (
        <Select onValueChange={handleSelection} onOpenChange={handleToggleSelect} >
            <SelectTrigger className="bg-accent text-white border-none flex items-center justify-end w-1/2">
                <SelectValue placeholder={conversion} className="text-black placeholder-text-black"/>
            </SelectTrigger>
            <SelectContent className="text-black bg-white">
                <SelectGroup>
                    {conversionList?.map((type: AcceptedFilTypes) => (
                        <SelectItem key={type + uuidv4()} value={type}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}