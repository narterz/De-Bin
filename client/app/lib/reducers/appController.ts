import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppController, SelectState, DialogState, TooltipState } from '@/app/utils/types';

const initialState: AppController = {
    dialogState: {
        dialogName: 'none',
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
    } as TooltipState,
    isMajorFailure: false
}

export const handleMajorErrorResponse = () => {
    setMajorError()
}

const appControllerSlice = createSlice({
    name: 'appController',
    initialState,
    reducers: {
        openDialog: (state, action: PayloadAction<DialogState>) => {
            state.dialogState = action.payload
        },
        closeDialog: (state) => {
            state.dialogState = initialState.dialogState;
            state.isMajorFailure = false;
        },
        setMajorError: (state) => {
            state.isMajorFailure = true;
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

export const { openDialog, closeDialog, toggleSelect, dialogErrorList, toggleTooltip, setMajorError } = appControllerSlice.actions;
export default appControllerSlice.reducer