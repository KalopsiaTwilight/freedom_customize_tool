import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";
import log from "electron-log/main"
import Store from "electron-store"
import fs from "node:fs"
import path from "node:path"
import { exec, spawn } from "node:child_process"

import { AppDataStore, ItemData, ItemGeoSetData, Patch, PatchResult } from "../models"
import { inventoryTypeToItemId, inventoryTypeToItemSlot } from "../utils";
import { CallApplyPatchChannel, OnPatchToolExitChannel } from "./channels";


let patchToolPath = "";
let appStore: Store<AppDataStore>;
let mainWindow: BrowserWindow;

export const setupPatchingIpc = (renderWindow: BrowserWindow, toolPath: string, store: Store<AppDataStore>) => {
    mainWindow = renderWindow;
    patchToolPath = toolPath;
    appStore = store;
    ipcMain.handle(CallApplyPatchChannel, applyPatch);
}

async function applyPatch() {
    const itemData = appStore.get('itemData');
    const settings = appStore.get('settings');

    const patch = itemDataToPatch(itemData);
    
    const patchPath = path.join(process.resourcesPath, "custom_item.json")
    await fs.promises.writeFile(patchPath, JSON.stringify(patch));

    const clientFilesPath = path.join(settings.freedomWoWRootDir, "files\\dbfilesclient");
    const child = exec(`"${patchToolPath}" "${patchPath}" "${clientFilesPath}"`, {
        cwd: process.resourcesPath,
        windowsHide: true
    })

    let stdOut = "";
    let stdErr = "";
    child.stdout.on('data', (data) => { stdOut += data; });
    child.stderr.on('data', (data) => { stdErr += data; });
    child.on('exit', (exitCode, signal) => {
        if (exitCode != 0) {
            log.warn("DBXPatchingTool exited with code: " + exitCode);
            log.warn(stdOut + stdErr);
        }
        mainWindow.webContents.send(OnPatchToolExitChannel, {
            resultCode: exitCode,
            message: stdOut
        })

        if (settings.launchWoWAfterPatch) {
            const launcherPath = path.join(settings.freedomWoWRootDir, "Arctium WoW Launcher.exe")
            spawn(`"${launcherPath}"`, {
                cwd: settings.freedomWoWRootDir,
                shell: true,
                windowsHide: false,
                detached: true
            })
        }
    })
}

function itemDataToPatch(itemData: ItemData): Patch 
{    // Convert ItemData to Patch
    const output: Patch = {
        Add: [],
        Lookup: [],
        Update: []
    };

    const itemId = inventoryTypeToItemId(itemData.inventoryType);
    // Update Item?
    output.Update.push({
        Filename: "ItemSparse.db2",
        RecordId: itemId,
        Record: [{
            ColumnName: "Display_lang",
            Value: itemData.name
        }]
    })
    // Add geoset records for helmets
    if (itemData.inventoryType === 1) {
        const processGeoSetInstruction = (instructions: ItemGeoSetData[], referenceName: string) => {
            for (const instruction of instructions) {
                output.Add.push({
                    Filename: "HelmetGeosetData.db2",
                    GenerateIds: [{
                        "Name": referenceName,
                        "Field": "HelmetGeosetVisDataID",
                        "OverrideExisting": false,
                    }],
                    Record: [{
                        "ColumnName": "RaceID",
                        "Value": instruction.race
                    }, {
                        "ColumnName": "HideGeosetGroup",
                        "Value": instruction.group
                    }, {
                        "ColumnName": "HelmetGeosetVisDataID",
                        "ReferenceId": referenceName
                    }],
                    SaveReferences: []
                })
            }
        }
        // Process Geo Set M
        processGeoSetInstruction(itemData.helmetGeoVisFemale, "_Geoset.Id_F");
        processGeoSetInstruction(itemData.helmetGeoVisMale, "_Geoset.Id_M");
    }
    // Process particle color override records
    if (itemData.particleColors.length > 0) {
        output.Add.push({
            Filename: "ParticleColor.db2",
            SaveReferences: [{
                Name: "_ParticleColor.Id"
            }],
            GenerateIds: [],
            Record: [{
                ColumnName: "Start0",
                Value: itemData.particleColors[0][0]^0,
            }, {
                ColumnName: "Start1",
                Value: itemData.particleColors[1][0]^0,
            }, {
                ColumnName: "Start2",
                Value: itemData.particleColors[2][0]^0,
            }, {
                ColumnName: "MID0",
                Value: itemData.particleColors[0][1]^0,
            }, {
                ColumnName: "MID1",
                Value: itemData.particleColors[1][1]^0,
            }, {
                ColumnName: "MID2",
                Value: itemData.particleColors[2][1]^0,
            }, {
                ColumnName: "End0",
                Value: itemData.particleColors[0][2]^0,
            }, {
                ColumnName: "End1",
                Value: itemData.particleColors[1][2]^0,
            }, {
                ColumnName: "End2",
                Value: itemData.particleColors[2][2]^0,
            }],
        });
    }

    // Component 1 model
    if (itemData.itemComponentModels["0"].models.length > 0)
    {
        output.Lookup.push({
            Filename: "ModelFileData.db2",
            Field: "FileDataID",
            SearchValue: itemData.itemComponentModels["0"].models[0].fileId,
            SaveReferences: [
                {
                    Name: "_ComponentModel0.ModelResourcesID",
                    Field: "ModelResourcesID",
                }
            ],
            IgnoreFailure: true,
        })
    }
    
    // Component 1 texture
    if (itemData.itemComponentModels["0"].texture.id > 0)
    {
        output.Lookup.push({
            Filename: "TextureFileData.db2",
            Field: "FileDataID",
            SearchValue: itemData.itemComponentModels["0"].texture.id,
            SaveReferences: [
                {
                    Name: "_ComponentModel0.TextureId",
                    Field: "MaterialResourcesID",
                }
            ],
            IgnoreFailure: true,
        })
    }

    // Component 2 model
    if (itemData.itemComponentModels["1"].models.length > 0)
    {
        output.Lookup.push({
            Filename: "ModelFileData.db2",
            Field: "FileDataID",
            SearchValue: itemData.itemComponentModels["1"].models[0].fileId,
            SaveReferences: [
                {
                    Name: "_ComponentModel1.ModelResourcesID",
                    Field: "ModelResourcesID",
                }
            ],
            IgnoreFailure: true,
        })
    }
    
    // Component 1 texture
    if (itemData.itemComponentModels["1"].texture.id > 0)
    {
        output.Lookup.push({
            Filename: "TextureFileData.db2",
            Field: "FileDataID",
            SearchValue: itemData.itemComponentModels["1"].texture.id,
            SaveReferences: [
                {
                    Name: "_ComponentModel1.TextureId",
                    Field: "MaterialResourcesID",
                }
            ],
            IgnoreFailure: true,
        })
    }

    // Create display info record
    output.Add.push({
        GenerateIds: [],
        Filename: "ItemDisplayInfo.db2",
        SaveReferences: [
            {
                Name: "_ItemDisplayInfo.Id",
            }
        ],
        Record: [
            {
                ColumnName: "ParticleColorID",
                ReferenceId: "_ParticleColor.Id",
                FallBackValue: 0,
            },
            {
                ColumnName: "Flags",
                Value: itemData.flags,
            },
            {
                ColumnName: "ModelResourcesID0",
                ReferenceId: "_ComponentModel0.ModelResourcesID",
                FallBackValue: 0,
            },
            {
                ColumnName: "ModelResourcesID1",
                ReferenceId: "_ComponentModel1.ModelResourcesID",
                FallBackValue: 0,
            },
            {
                ColumnName: "ModelMaterialResourcesID0",
                ReferenceId: "_ComponentModel0.TextureId",
                FallBackValue: 0,
            },
            {
                ColumnName: "ModelMaterialResourcesID1",
                ReferenceId: "_ComponentModel1.TextureId",
                FallBackValue: 0,
            },
            {
                ColumnName: "ModelType1",
                Value: itemData.inventoryType === 16 ? 4 : 0
            },
            {
                ColumnName: "GeosetGroup0",
                Value: itemData.geoSetGroup[0],
            },
            {
                ColumnName: "GeosetGroup1",
                Value: itemData.geoSetGroup[1]
            },
            {
                ColumnName: "GeosetGroup2",
                Value: itemData.geoSetGroup[2],
            },
            {
                ColumnName: "GeosetGroup3",
                Value: itemData.geoSetGroup[3],
            },
            {
                ColumnName: "GeosetGroup4",
                Value: itemData.geoSetGroup[4],
            },
            {
                ColumnName: "HelmetGeosetVis0",
                ReferenceId: "_Geoset.Id_M",
                FallBackValue: 0,
            },
            {
                ColumnName: "HelmetGeosetVis1",
                ReferenceId: "_Geoset.Id_F",
                FallBackValue: 0,
            }
        ]
    });

    for(const sectionStr in itemData.itemMaterials) {
        if (itemData.itemMaterials[sectionStr].length === 0) {
            continue;
        } 
        const fileId = itemData.itemMaterials[sectionStr][0].fileId;
        output.Lookup.push({
            Filename: "TextureFileData.db2",
            Field: "FileDataID",
            SearchValue: fileId,
            SaveReferences: [
                {
                    Name: `_ItemMaterial_${sectionStr}_.MaterialResourcesId`,
                    Field: "MaterialResourcesID",
                }
            ],
            IgnoreFailure: false,
        });

        output.Add.push({
            GenerateIds: [],
            SaveReferences: [],
            Filename: "ItemDisplayInfoMaterialRes.db2",
            Record: [
                {
                    ColumnName: "ComponentSection",
                    Value: parseInt(sectionStr, 10),
                }, {
                    ColumnName: "MaterialResourcesID",
                    ReferenceId: `_ItemMaterial_${sectionStr}_.MaterialResourcesId`,
                }, {
                    ColumnName: "ItemDisplayInfoID",
                    ReferenceId: "_ItemDisplayInfo.Id",
                }
            ]
        });
    }

    output.Add.push({
        Filename: "ItemAppearance.db2",
        GenerateIds: [],
        SaveReferences: [{ Name: "_ItemAppearance.Id", }],
        Record: [{
                ColumnName: "DisplayType",
                Value: (inventoryTypeToItemSlot(itemData.inventoryType)),
            }, {
                ColumnName: "ItemDisplayInfoID",
                ReferenceId: "_ItemDisplayInfo.Id",
            }
        ]
    })
    
    output.Update.push({
        Filename: "ItemModifiedAppearance.db2",
        RecordId: itemId,
        Field: "ItemID",
        Record: [{
                ColumnName: "ItemAppearanceID",
                ReferenceId: "_ItemAppearance.Id",
            }, {
                ColumnName: "TransmogSourceTypeEnum",
                Value: 2,
            }
        ]
    });
    return output;
}