import { CustomTextureData, ItemData, ItemFileData } from "../../models";

export async function uploadTextureFile(filePath: string, gender: number = 3, race: number = 0, classId: number = 0): Promise<CustomTextureData> 
{
    const fileData = await window.api.loadFile(filePath);
    const pngData = await window.api.convertToPng(fileData);

    const id = await uploadTextureFileToExpress(pngData);
    
    return { 
        id,
        data: pngData,
        fileName: filePath,
        gender,
        race,
        class: classId
    }
}

export async function uploadCustomTexture(data: CustomTextureData) {
    await uploadTextureFileToExpress(data.data, data.id);
}

export function freeUnusedCustomTextures(item: ItemData) {
    const usedImgs: number[] = [];
    for(const sectionId in item.itemMaterials) {
        for(const texture of item.itemMaterials[sectionId]) {
            if (isCustomTexture(texture.fileId)) {
                usedImgs.push(texture.fileId);
            }
        }
    }
    for(const sectionId in item.itemComponentModels) {
        const texture = item.itemComponentModels[sectionId].texture;
        if (isCustomTexture(texture.id)) {
            usedImgs.push(texture.id);
        }
    }
    item.customTextures = item.customTextures.filter(x => usedImgs.indexOf(x.id) !== -1);
    return item;
}

async function uploadTextureFileToExpress(pngData: string, id?: number): Promise<number> {
    const webpData = await window.api.convertToWebp(pngData);

    const resp = await fetch(`${window.EXPRESS_URI}/addImage`, {
        method: "POST",
        body: JSON.stringify({imgData: webpData, id}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await resp.json();
    return data.Id as number;
}

export async function downloadTextureFile(fileId: number) {
    const blobToDataUri = (blob: Blob) => {
        return new Promise<string>((res, rej) => {
            try {        
                const reader = new FileReader();
                reader.onload = function() { res(this.result.toString())};
                reader.readAsDataURL(blob);
            }
            catch(e) {
                rej(e);
            }
        });
    }

    const uri = `${window.EXPRESS_URI}/zam/modelviewer/live/textures/${fileId}.webp`
    const resp = await fetch(uri);
    const imgBlob = await resp.blob();
    const dataUri = await blobToDataUri(imgBlob);
    const base64Data = dataUri.split(';base64,').pop();

    const pngData = await window.api.convertToPng(base64Data);
    const pngBlob = b64toBlob(pngData, "image/png")
    var a = document.createElement("a");
    a.href = URL.createObjectURL(pngBlob);
    a.download = `${fileId}.png`;
    a.click();
}

export function isCustomTexture(id: number) {
    return id > 6000000;
}

function b64toBlob(b64Data: string , contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
      
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}