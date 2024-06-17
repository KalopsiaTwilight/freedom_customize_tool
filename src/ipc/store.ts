
import { ipcMain } from "electron";
import Store from "electron-store"

import { AppDataStore } from "../models"
import { CallGetStoreKeyChannel, CallSetStoreKeyChannel } from "./channels";


export const setUpStoreIpc = (store: Store<AppDataStore>) => {
    ipcMain.handle(CallGetStoreKeyChannel, (_, key: keyof AppDataStore) => {
        return store.get(key);
    });
    ipcMain.handle(CallSetStoreKeyChannel, (_, key: keyof AppDataStore, obj: any) => {
        return store.set(key, obj);
    });
}