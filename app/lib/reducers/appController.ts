import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppController, SelectState, DialogState, TooltipState } from '@/app/utils/types';

const initialState: AppController = {
    dialogState: {
        dialogIsOpen: false,
        dialogHeader: '',
        dialogBody: '',
        dialogList: []
    } as DialogState,
    selectState: {
        selectIsOpen: false,
    } as SelectState,
    tooltipState: {
        tooltipIsOpen: false
    } as TooltipState
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
        toggleTooltip: (state) => {
            state.tooltipState.tooltipIsOpen = !state.tooltipState.tooltipIsOpen;
        }
    }
})

export const { openDialog, closeDialog, toggleSelect, dialogErrorList, toggleTooltip } = appControllerSlice.actions;
export default appControllerSlice.reducer