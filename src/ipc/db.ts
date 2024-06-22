import { ipcMain } from "electron";
import { Database } from "sqlite3";
import log from "electron-log"

import { getAsync, allAsync, execAsync } from "../utils";
import { CallDbAllChannel, CallDbExecChannel, CallDbGetChannel } from "./channels";

export const setupDbIpc = (db: Database) => {
  ipcMain.handle(CallDbAllChannel, async (_, query: string, ...params: any[]) => {
    try {
      log.debug("Executing getAll query: ", query);
      const resp = await allAsync(db, query, ...params);
      log.debug("finished getAll query.");
      return { result: resp, error: undefined }
    } catch (error) {
      return { result: undefined, error }
    }
  });
  ipcMain.handle(CallDbGetChannel, async (_, query: string, ...params: any[]) => {
    try {
      log.debug("Executing get query: ", query);
      const resp = await getAsync(db, query, ...params);
      log.debug("Finished get query.");
      return { result: resp, error: undefined }
    } catch (error) {
      return { result: undefined, error }
    }
  });
  ipcMain.handle(CallDbExecChannel, async (_, query: string) => {
    try {
      log.debug("Executing exec query: ", query);
      const resp = await execAsync(db, query);
      log.debug("Finished exec query: ", query);
      return { result: resp, error: undefined }
    } catch (error) {
      return { result: undefined, error }
    }
  });
}
