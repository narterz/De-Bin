import { RootState } from "./store";

export const appController = (state: RootState) => state.controller;
export const processFile = (state: RootState) => state.process;