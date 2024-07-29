import { CustomTextureData, ItemData } from "../../models";
import { reloadComponentTextures } from "./item-component-textures";
import { reloadTextures } from "./item-texture";
import { previewCustomItem } from "./preview-item";

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
    const base64Data = await downloadTextureFileFromZam(fileId);

    const pngData = await window.api.convertToPng(base64Data);
    const pngBlob = b64toBlob(pngData, "image/png")
    var a = document.createElement("a");
    a.href = URL.createObjectURL(pngBlob);
    a.download = `${fileId}.png`;
    a.click();
}

async function downloadTextureFileFromZam(fileId: number) {
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
    return dataUri.split(';base64,').pop();
}

export async function updateColorizePreview() {
    const row = $("<div class='row'>");

    const itemData = await window.store.get('itemData');

    const textureIds = $("#ci_hst_texture_id").val().toString().split(',').map(x => parseInt(x));
    const hue = parseInt($("#ci_hst_hue").val().toString());
    const brightness = parseFloat($("#ci_hst_brightness").val().toString());
    const saturation = parseFloat($("#ci_hst_saturation").val().toString());
    const lightness = parseInt($("#ci_hst_lightness").val().toString());

    for(const textureId of textureIds) {
        const col = $("<div class='col-6 mb-3'>");
        let imgData = "";
        if (isCustomTexture(textureId)) {
            imgData = itemData.customTextures.find(x => x.id === textureId).data;
        }
        else {
            imgData = await downloadTextureFileFromZam(textureId);
        }

        imgData = await window.api.colorizeImg(imgData, hue, brightness, saturation, lightness)
        const imgUri = `data:image/png;base64,${imgData}`
        const img = $(`<img src="${imgUri}" width=200 height=200 />`);
        col.append(img);
        row.append(col);
    }
    $("#ci_hst_preview").html(row.html());
}

export function isCustomTexture(id: number) {
    return id > 6000000;
}

export async function onSubmitColorize() {
    const itemData = await window.store.get('itemData');

    const hue = parseInt($("#ci_hst_hue").val().toString());
    const brightness = parseFloat($("#ci_hst_brightness").val().toString());
    const saturation = parseFloat($("#ci_hst_saturation").val().toString());
    const lightness = parseInt($("#ci_hst_lightness").val().toString());

    const textureIds = $("#ci_hst_texture_id").val().toString().split(',').map(x => parseInt(x));
    for(const textureId of textureIds) {
        let imgData = "";
        if (isCustomTexture(textureId)) {
            imgData = itemData.customTextures.find(x => x.id === textureId).data;
        }
        else {
            imgData = await downloadTextureFileFromZam(textureId);
        }
        imgData = await window.api.colorizeImg(imgData, hue, brightness, saturation, lightness)

        const id = await uploadTextureFileToExpress(imgData);
        if (itemData.itemComponentModels[0].texture.id === textureId) {
            itemData.itemComponentModels[0].texture.id = id;
            itemData.itemComponentModels[0].texture.name = "Custom Colorized Texture";
            
            itemData.customTextures.push({
                class: 0,
                data: imgData,
                fileName: "Custom Colorized Texture",
                gender: 3,
                race: 0,
                id
            })
        } else if (itemData.itemComponentModels[1].texture.id === textureId) {
            itemData.itemComponentModels[1].texture.id = id;
            itemData.itemComponentModels[1].texture.name = "Custom Colorized Texture";
            
            itemData.customTextures.push({
                class: 0,
                data: imgData,
                fileName: "Custom Colorized Texture",
                gender: 3,
                race: 0,
                id
            })
        } else {
            for(const section in itemData.itemMaterials) {
                const textureIndex = itemData.itemMaterials[section].findIndex(x => x.fileId === textureId);
                if (textureIndex > -1) {
                    itemData.itemMaterials[section][textureIndex].fileId = id; 
                    itemData.itemMaterials[section][textureIndex].fileName = "Custom Colorized Texture";
                    
                    
                    itemData.customTextures.push({
                        class: itemData.itemMaterials[section][textureIndex].class,
                        data: imgData,
                        fileName: "Custom Colorized Texture",
                        gender: itemData.itemMaterials[section][textureIndex].gender,
                        race: itemData.itemMaterials[section][textureIndex].race,
                        id
                    })
                    break;
                }
            }
        }
    }

    await window.store.set('itemData', freeUnusedCustomTextures(itemData));
    await reloadComponentTextures();
    await reloadTextures();
    await previewCustomItem();
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