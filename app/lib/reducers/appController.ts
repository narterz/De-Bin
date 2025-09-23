import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppController, SelectState, DialogState } from '@/app/utils/types';

const initialState: AppController = {
    dialogState: {
        dialogIsOpen: false,
        dialogHeader: '',
        dialogBody: '',
        dialogList: []
    } as DialogState,
    selectState: {
        selectIsOpen: false,
    } as SelectState
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
        toggleSelect: (state) => {
            state.selectState.selectIsOpen = !state.selectState.selectIsOpen;
        },
    }
})

export const { openDialog, closeDialog, toggleSelect, dialogErrorList } = appControllerSlice.actions;
export default appControllerSlice.reducer