import { ipcMain } from "electron";
import { Database } from "sqlite3";

import { getAsync, allAsync, execAsync } from "../utils";
import { CallDbAllChannel, CallDbExecChannel, CallDbGetChannel } from "./channels";

export const setupDbIpc = (db: Database) => {
  ipcMain.handle(CallDbAllChannel, async (_, query: string, ...params: any[]) => {
    try {
      const resp = await allAsync(db, query, ...params);
      return { result: resp, error: undefined }
    } catch (error) {
      return { result: undefined, error }
    }
  });
  ipcMain.handle(CallDbGetChannel, async (_, query: string, ...params: any[]) => {
    try {
      const resp = await getAsync(db, query, ...params);
      return { result: resp, error: undefined }
    } catch (error) {
      return { result: undefined, error }
    }
  });
  ipcMain.handle(CallDbExecChannel, async (_, query: string) => {
    try {
      const resp = await execAsync(db, query);
      return { result: resp, error: undefined }
    } catch (error) {
      return { result: undefined, error }
    }
  });
}
