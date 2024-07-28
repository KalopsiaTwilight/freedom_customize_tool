import { BrowserWindow, ipcMain } from "electron";
import sharp from "sharp";


import { CallConvertToPngChannel, CallConvertToWebpChannel } from "./channels";

export const setupSharpIpc = (mainWindow: BrowserWindow) => {
  ipcMain.handle(CallConvertToWebpChannel, async (_, base64Data: string) => {
    let imgBuffer = Buffer.from(base64Data, 'base64');
    const webpBuffer = await sharp(imgBuffer)
      .webp( {
        lossless: true,
      })
      .toBuffer();
    return webpBuffer.toString('base64');
  })

  ipcMain.handle(CallConvertToPngChannel, async (_, base64Data: string) => {
    let imgBuffer = Buffer.from(base64Data, 'base64');
    const pngBuffer = await sharp(imgBuffer)
      .png({ })
      .toBuffer();
    return pngBuffer.toString('base64');
  })
}
