// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { 
	CallDbAllChannel, CallDbExecChannel, CallDbGetChannel, CallApplyPatchChannel,
	CallGetStoreKeyChannel, CallSetStoreKeyChannel, CallFolderSelectDialogChannel, CallOpenLogFileChannel, CallSetMenuDisabledChannel, CallGetExpressUriChannel 
} from "./ipc/channels"

contextBridge.exposeInMainWorld("api", {
	getExpressAppUrl: () => 
		ipcRenderer.invoke(CallGetExpressUriChannel),
	applyItemPatch: () => 
		ipcRenderer.invoke(CallApplyPatchChannel),
	selectFolder: () => 
		ipcRenderer.invoke(CallFolderSelectDialogChannel),
	openLogFile: () => 
		ipcRenderer.invoke(CallOpenLogFileChannel),
	setMenuItemDisabled: (menuIndex: number, itemIndex: number, disabled = true) => 
		ipcRenderer.invoke(CallSetMenuDisabledChannel, menuIndex, itemIndex, disabled)
});

contextBridge.exposeInMainWorld("db", {
	all: (query:string, ...params: any[]) => ipcRenderer.invoke(CallDbAllChannel, query, ...params),
	exec: (query:string) => ipcRenderer.invoke(CallDbExecChannel, query),
	get: (query:string, ...params: any[]) => ipcRenderer.invoke(CallDbGetChannel, query, ...params),
})

contextBridge.exposeInMainWorld("store", {
	get: (key: string) => ipcRenderer.invoke(CallGetStoreKeyChannel, key),
	set: (key: string, val: any) => ipcRenderer.invoke(CallSetStoreKeyChannel, key, val),
})

contextBridge.exposeInMainWorld("ipcRenderer", {
	on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
		ipcRenderer.on(channel, listener);
	},
	off: (channel: string) => {
		ipcRenderer.removeAllListeners(channel);
	}
});