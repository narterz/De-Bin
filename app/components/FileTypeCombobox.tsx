import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { appController, processFile } from "../lib/selectors";
import { toggleComboBox, setComboboxFileType } from "../lib/reducers/appController";

export default function FileTypeCombobox(){
    const dispatch = useAppDispatch();
    const comboboxState = useAppSelector(appController).comboboxState;
    const fileState = useAppSelector(processFile).fileConversion;

    const handleToggleCombobox = (open:any) => {
        if(!open) {
            console.debug(`combobox is now ${comboboxState.comboboxIsOpen ? 'opened' : 'closed'}`)
            dispatch(toggleComboBox())
        }
    }

    const handleComboboxSelection = (selection: string) => {
        console.debug(`Closing combo box with selected file type ${selection}`)
        dispatch(setComboboxFileType(selection))
        dispatch(toggleComboBox())
    }

    return (
        <Popover open={comboboxState.comboboxIsOpen} onOpenChange={(open) => handleToggleCombobox(open)}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    role="combobox"
                    aria-expanded={comboboxState.comboboxIsOpen}
                    className=""
                >
                    {fileState.conversion}
                    <ChevronsUpDownIcon className="file-type-icon"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Command>
                    <CommandGroup>
                        <CommandList>
                            {fileState.conversionList.map((type) => (
                                <CommandItem
                                    key={type}
                                    value={type}
                                    onSelect={() => handleComboboxSelection(type)}
                                >
                                    <CheckIcon className={`file-type-icon ${type === comboboxState.selectedType ? 'opacity-100' : 'opacity-0'}`} />
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )

}