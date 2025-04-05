"use client"
import { configureStore } from "@reduxjs/toolkit";
import processFiles from './reducers/processFiles';

export const store = configureStore({
    reducer: {
        process: processFiles
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch