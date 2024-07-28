import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log/main"
import Store from "electron-store"
import { exec, spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import util from "node:util";
import { EOL } from "node:os";

import { AppDataStore, ItemData, ItemGeoSetData, Patch, InventoryType, ItemComponentSection } from "../models"
import { inventoryTypeToItemId, inventoryTypeToItemDisplayType } from "../utils";
import { CallApplyPatchChannel, OnPatchToolExitChannel } from "./channels";


let toolsPath = "";
let appStore: Store<AppDataStore>;
let mainWindow: BrowserWindow;

export const setupPatchingIpc = (renderWindow: BrowserWindow, toolPath: string, store: Store<AppDataStore>) => {
    mainWindow = renderWindow;
    toolsPath = toolPath;
    appStore = store;
    ipcMain.handle(CallApplyPatchChannel, applyPatch);
}

async function applyPatch() {
    const itemData = appStore.get('itemData');
    const settings = appStore.get('settings');

    const patch = itemDataToPatch(itemData);
    
    // Write Texture files
    const execAsync = util.promisify(exec);
    const customFilesPath = path.join(settings.freedomWoWRootDir, "files\\freedom_customize_tool");
    if (!fs.existsSync(customFilesPath)) {
        await util.promisify(fs.mkdir)(customFilesPath);
    }
    let customFileMapping = "";
    const customFileMappingPath = path.join(settings.freedomWoWRootDir, "mappings\\freedom_customize_tool.txt");
    const blpConverterExePath = path.join(toolsPath, "BLPConverter.exe")
    for (const customTexture of itemData.customTextures) {
        const pngFileName = path.join(customFilesPath, customTexture.id + ".png");
        await fs.promises.writeFile(pngFileName, customTexture.data, 'base64');
        await execAsync(`"${blpConverterExePath}" /R "${pngFileName}"`);
        customFileMapping += `${customTexture.id};freedom_customize_tool/${customTexture.id}.blp${EOL}`
        // todo: delete png file?
    }
    await fs.promises.writeFile(customFileMappingPath, customFileMapping, 'utf-8');
    
    // Write Custom Item JSON file
    const patchPath = path.join(process.resourcesPath, "custom_item.json")
    log.debug("Writing custom patch json to: ", patchPath);
    await fs.promises.writeFile(patchPath, JSON.stringify(patch));

    const dbclientFilesPath = path.join(settings.freedomWoWRootDir, "files\\dbfilesclient");
    const patchToolExePath = path.join(toolsPath, "DBXPatchTool.exe")
    const child = exec(`"${patchToolExePath}" "${patchPath}" "${dbclientFilesPath}"`, {
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
    // Update item metadata
    output.Update.push({
        Filename: "Item.db2",
        RecordId: itemId,
        Record: [{
            ColumnName: "IconFileDataID",
            Value: itemData.metadata.fileIconId
        }, {
            ColumnName: "SheatheType",
            Value: itemData.metadata.sheatheType
        }, {
            ColumnName: "SubclassID",
            Value: itemData.metadata.subClass
        }]
    })
    output.Update.push({
        Filename: "ItemSparse.db2",
        RecordId: itemId,
        Record: [{
            ColumnName: "Display_lang",
            Value: itemData.metadata.name
        }, {
            ColumnName: "OverallQualityID",
            Value: itemData.metadata.rarity
        }]
    })
    // Add geoset records for helmets
    if (itemData.inventoryType === InventoryType.Head) {
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
    
    // Set Component 1 Texture if item is a cloak. 
    if (itemData.inventoryType === InventoryType.Back 
        && itemData.itemMaterials[ItemComponentSection.Cloak] 
        && itemData.itemMaterials[ItemComponentSection.Cloak].length) 
    {
        output.Lookup.push({
            Filename: "TextureFileData.db2",
            Field: "FileDataID",
            SearchValue: itemData.itemMaterials[ItemComponentSection.Cloak][0].fileId,
            SaveReferences: [
                {
                    Name: "_ComponentModel0.TextureId",
                    Field: "MaterialResourcesID",
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
                ColumnName: "ModelType0",
                Value: itemData.inventoryType === InventoryType.Back ? 5 : 0
            },
            {
                ColumnName: "ModelType1",
                Value: itemData.inventoryType === InventoryType.Back ? 4 : 0
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

    // Skip Cloaks here because texture data goes into component 1 slot
    if (itemData.inventoryType !== 16)
    {
        for(const sectionStr in itemData.itemMaterials) {
            const textures = itemData.itemMaterials[sectionStr];
            if (itemData.itemMaterials[sectionStr].length === 0) {
                continue;
            } 

            if (textures[0].fileId >= 6000000) {
                for(const texture of textures) {
                    output.Add.push({
                        Filename: "TextureFileData.db2",
                        RecordId: texture.fileId,
                        GenerateIds: [{
                            Name: `_ItemMaterial_${sectionStr}_.MaterialResourcesId`,
                            Field: "MaterialResourcesID",
                            OverrideExisting: false,
                            StartFrom: 770000
                        }],
                        Record: [
                            {
                                ColumnName: "MaterialResourcesID",
                                ReferenceId: `_ItemMaterial_${sectionStr}_.MaterialResourcesId`
                            }
                        ],
                        SaveReferences: []
                    })
                    output.Add.push({
                        Filename: "ComponentTextureFileData.db2",
                        GenerateIds: [],
                        RecordId: texture.fileId,
                        Record: [
                            {
                                ColumnName: "GenderIndex",
                                Value: texture.gender
                            }, 
                            {
                                ColumnName: "ClassID",
                                Value: texture.class
                            }, 
                            {
                                ColumnName: "RaceID",
                                Value: texture.race
                            }, 
                        ],
                        SaveReferences: []
                    })
                }
            } else {
                output.Lookup.push({
                    Filename: "TextureFileData.db2",
                    Field: "FileDataID",
                    SearchValue: textures[0].fileId,
                    SaveReferences: [
                        {
                            Name: `_ItemMaterial_${sectionStr}_.MaterialResourcesId`,
                            Field: "MaterialResourcesID",
                        }
                    ],
                    IgnoreFailure: false,
                });
            }

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
    }

    output.Add.push({
        Filename: "ItemAppearance.db2",
        GenerateIds: [],
        SaveReferences: [{ Name: "_ItemAppearance.Id", }],
        Record: [{
                ColumnName: "DisplayType",
                Value: (inventoryTypeToItemDisplayType(itemData.inventoryType)),
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