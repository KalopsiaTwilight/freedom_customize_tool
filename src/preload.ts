// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { 
	CallDbAllChannel, CallDbExecChannel, CallDbGetChannel, CallApplyPatchChannel, CallSetFirstTimeConfigChannel 
} from "./ipc/channels"

import { ItemData } from "./models";

contextBridge.exposeInMainWorld("api", {
	getExpressAppUrl: () => ipcRenderer.invoke("get-express-app-url"),
	applyItemPatch: (item: ItemData, name: string) => ipcRenderer.invoke(CallApplyPatchChannel, item, name),
	setupConfig: (wowPath: string, startWoWAfterPatch: boolean) => ipcRenderer.invoke(CallSetFirstTimeConfigChannel, wowPath, startWoWAfterPatch),
});

contextBridge.exposeInMainWorld("db", {
	all: (query:string, ...params: any[]) => ipcRenderer.invoke(CallDbAllChannel, query, ...params),
	exec: (query:string) => ipcRenderer.invoke(CallDbExecChannel, query),
	get: (query:string, ...params: any[]) => ipcRenderer.invoke(CallDbGetChannel, query, ...params),
})

contextBridge.exposeInMainWorld("ipcRenderer", {
	on: (channel: string, listener: (event: any, ...args: any[]) => void) => {
		ipcRenderer.on(channel, listener);
	}
});