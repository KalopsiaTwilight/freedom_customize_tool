export interface ExpressIPCMessage<T> {
    type: string;
    data: T
}

export const ExpressPortInfoType = "express:port-info";
export const ExpressSendWoWDirType = "express:wow-dir";

export type ExpressPortInfoMessage = ExpressIPCMessage<number>
export type ExpressSendWoWDirMessage = ExpressIPCMessage<string>

export function isPortInfoMessage(obj: any): obj is ExpressPortInfoMessage
{
    return obj && obj.type && obj.type === ExpressPortInfoType;
}

export function isSendWoWMessage(obj: any): obj is ExpressSendWoWDirMessage
{
    return obj && obj.type && obj.type === ExpressSendWoWDirType;
}