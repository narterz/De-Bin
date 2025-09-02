import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppController, ComboBoxState, DialogState } from '@/app/utils/types';

const initialState: AppController = {
    dialogState: {
        dialogIsOpen: false,
        dialogHeader: '',
        dialogBody: '',
        dialogList: []
    } as DialogState,
    comboboxState: {
        comboboxIsOpen: false,
        selectedType: ''
    } as ComboBoxState
}

const appControllerSlice = createSlice({
    name: 'appController',
    initialState,
    reducers: {
        openDialog: (state, action: PayloadAction<{header: string, body: string}>) => {
            state.dialogState.dialogIsOpen = true;
            const { body, header } = action.payload;
            state.dialogState.dialogHeader = header;
            state.dialogState.dialogBody = body;
            
        },
        closeDialog: (state) => {
            state.dialogState = initialState.dialogState;
        },
        dialogErrorList: (state, action: PayloadAction<DialogState['errorList']>) => {
            state.dialogState.errorList = action.payload
        },
        toggleComboBox: (state) => {
            state.comboboxState.comboboxIsOpen = !state.comboboxState.comboboxIsOpen
        },
        setComboboxFileType: (state, action: PayloadAction<string>) => {
            state.comboboxState.selectedType = action.payload
        }
    }
})

export const { openDialog, closeDialog, toggleComboBox, setComboboxFileType, dialogErrorList } = appControllerSlice.actions;
export default appControllerSlice.reducer