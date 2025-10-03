"use client"
import { configureStore } from "@reduxjs/toolkit";
import processFiles from './reducers/processFiles';
import appController from "./reducers/appController";

export const store = configureStore({
    reducer: {
        process: processFiles,
        controller: appController
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch