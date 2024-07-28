import { BrowserWindow, Menu, dialog, ipcMain } from "electron";
import log from "electron-log";
import { exec } from "node:child_process"
import { readFileSync } from "node:fs";

import { 
  CallFileSelectDialogChannel, CallFolderSelectDialogChannel, CallLoadFileChannel, CallOpenLogFileChannel, 
  CallSetMenuDisabledChannel 
} from "./channels";

export const setupMiscIpc = (mainWindow: BrowserWindow) => {
    ipcMain.handle(CallFolderSelectDialogChannel, () => {
        return dialog.showOpenDialogSync(mainWindow, {
          properties: ['openDirectory']
        })
      })

    ipcMain.handle(CallFileSelectDialogChannel, (_, filters: Electron.FileFilter[]) => {
      return dialog.showOpenDialogSync(mainWindow, {
        properties: ['openFile'],
        filters
      })
    })
    
    ipcMain.handle(CallOpenLogFileChannel, () => {
      const logFile = log.transports.file.getFile();
      exec('start "" "' + logFile.path + '"');
    });
  
    ipcMain.handle(CallSetMenuDisabledChannel, (_, menuIndex, itemIndex, disabled = true) => {
      const menu = Menu.getApplicationMenu();
      menu.items[menuIndex].submenu.items[itemIndex].enabled = !disabled;
    });

    ipcMain.handle(CallLoadFileChannel, (_, path: string) => {
        return readFileSync(path, { encoding: "base64" });
    })
}
