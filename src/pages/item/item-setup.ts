import { debounce } from "../../utils";
import { CharacterModelData, ItemData } from "../../models";

import { onInventorySlotChange } from "./item-inventoryslot";
import { onSearchTexture, reloadTextures } from "./item-texture";
import { exportToFile, loadFile, loadItem, onRandomizeItem, onSearchItem } from "./item-loading";
import { hardRandomizeComponentTexture, onSearchComponentTexture, randomizeComponentTexture, reloadComponentTextures } from "./item-component-textures";
import { hardRandomizeComponentModel, onSearchComponentModel, randomizeComponentModel, reloadComponentModels } from "./item-component-models";
import { onSetParticleColors, reloadParticleColorComponents } from "./item-particle-colors";
import { onAddGeoSetOverride, reloadHelmetGeovisComponents } from "./item-helmet-geovis";
import { reloadFlagsComponents } from "./item-feature-flags";
import { reloadGeosetDisplay } from "./item-geoset-display";
import { hardRandomizeItemMetadata, onClearItemMetadata, onSearchItemMetadata, randomizeItemMetadata, reloadItemMetadata } from "./item-metadata";
import { onModelGenderChange, onModelRaceChange, reloadCharacterModel } from "./character-model";
import { previewCustomItem } from "./preview-item";

let windowResizeFn: () => void;

export default async function load() {
    const itemData = await window.store.get('itemData');

    setUpEventHandlers();
    await reloadAllSections(itemData.inventoryType)

    // Load character
    const settings = await window.store.get('settings');
    $("#ci_model_gender").val(settings.previewCharacter.gender);
    $("#ci_model_race").val(settings.previewCharacter.race);
    reloadCharacterModel(settings.previewCharacter);

    windowResizeFn = onWindowResize(settings.previewCharacter);
    $(window).on("resize", windowResizeFn);
}

function onWindowResize(defaultChar: CharacterModelData) {
    return debounce(() => {
        const currentRace = parseInt($("#ci_model_race").val().toString(), 10);
        const currentGender = parseInt($("#ci_model_gender").val().toString(), 10);
        if (currentGender != defaultChar.gender || currentRace != defaultChar.race) {
            reloadCharacterModel({
                race: currentRace,
                gender: currentGender,
                customizations: []
            });
        } else {
            reloadCharacterModel(defaultChar);
        }
    })
}

function setUpEventHandlers() {
    $("#ci_inventoryslot").on("change", onInventorySlotChange);

    $("#ci_texture_textureFile").on("keyup", debounce(() => {
        $("#ci_preview_page").val(0);
        onSearchTexture();
    }));
    $("#ci_componenttexture_file").on("keyup", debounce(() => {
        $("#ci_preview_page").val(0);
        onSearchComponentTexture();
    }));
    $("#ci_componentmodel_modelfile").on("keyup", debounce(() => {
        $("#ci_preview_page").val(0);
        onSearchComponentModel();
    }));
    $("#ci_itemIcon_filename").on("keyup", debounce(() => {
        $("#ci_preview_page").val(0);
        onSearchItemMetadata();
    }));

    $("#ci_item_search").on("keyup", debounce(onSearchItem));
    $("#loadItemBtn").on("click", loadItem);

    $("#setParticleOverride").on("click", onSetParticleColors);

    $("#addHelmetGeoVis").on("click", onAddGeoSetOverride);

    $("#exportBtn").on("click", exportToFile);
    $("#loadFileBtn").on("click", loadFile);

    $("#ci_model_gender").on("change", onModelGenderChange)
    $("#ci_model_race").on("change", onModelRaceChange)

    $("#randomizeItemBtn").on("click", onRandomizeItem)

    $("#btnRandomizeComponent1").on("click", onRandomizeComponent("0"));
    $("#btnHardRandomizeComponent1").on("click", onHardRandomizeComponent("0"));
    $("#btnClearComponent1").on("click", onClearComponent("0"));
    
    $("#btnRandomizeComponent2").on("click", onRandomizeComponent("1"));
    $("#btnHardRandomizeComponent2").on("click", onHardRandomizeComponent("1"));
    $("#btnClearComponent2").on("click", onClearComponent("1"))

    $("#ci_componentmodel_onlyForIs").on('click', () => {
        $("#ci_preview_page").val(0);
        onSearchComponentModel();
    })
    $("#ci_componenttexture_onlyForIs").on('click', () => {
        $("#ci_preview_page").val(0);
        onSearchComponentTexture();
    })
    $("#ci_texture_onlyForIs").on('click', () => {
        $("#ci_preview_page").val(0);
        onSearchTexture();
    })
    $("#ci_texture_onlyForSect").on('click', () => {
        $("#ci_preview_page").val(0);
        onSearchTexture();
    })

    $("#patchWoWBtn").on("click", () => {
        $.LoadingOverlay("show");
        window.api.applyItemPatch();
    });

    $("#ci_name").on("change", debounce(async () => { 
        const itemData = await window.store.get('itemData');
        itemData.metadata.name = $("#ci_name").val().toString();
        await window.store.set("itemData", itemData);
    })) 

    $("#btnEditItemIcon").on('click', () => {
        $("#ci_preview_page").val(0);
        onSearchItemMetadata();
    })

    $("#btnSoftRandomizeItemIcon").on('click', async () => {
        await randomizeItemMetadata();
        await reloadItemMetadata();
    })
    $("#btnHardRandomizeItemIcon").on('click', async () => {
        await hardRandomizeItemMetadata();
        await reloadItemMetadata();
    })
    $("#btnClearItemIcon").on('click', onClearItemMetadata);
    $("#ci_rarity").on('change', async () => {
        const itemData = await window.store.get('itemData');
        itemData.metadata.rarity = parseInt($("#ci_rarity").val().toString(), 10);
        await window.store.set('itemData', itemData);
    });
    $("#ci_subclass").on('change', async () => {
        const itemData = await window.store.get('itemData');
        itemData.metadata.subClass = parseInt($("#ci_subclass").val().toString(), 10);
        await window.store.set('itemData', itemData);
    });
    $("#ci_sheatheType").on('change', async () => {
        const itemData = await window.store.get('itemData');
        itemData.metadata.sheatheType = parseInt($("#ci_sheatheType").val().toString(), 10);
        await window.store.set('itemData', itemData);
    });
}

export function unload() {
    $(window).off("resize", windowResizeFn);
}

export async function reloadAllSections(inventorySlot: number) {
    $("#ci_inventoryslot").val(inventorySlot);
    await reloadItemMetadata();
    await reloadGeosetDisplay();
    await reloadTextures();
    await reloadComponentModels();
    await reloadComponentTextures();
    await reloadParticleColorComponents();
    await reloadFlagsComponents();
    await reloadHelmetGeovisComponents();
}

function onClearComponent(idStr: string) {
    return async () => {
        const itemData = await window.store.get('itemData');
        itemData.itemComponentModels[idStr] = {
            models: [],
            texture: {
                id: -1,
                name: ""
            }
        }
        await window.store.set('itemData', itemData);
        await previewCustomItem();
        await reloadComponentModels();
        await reloadComponentTextures();
    }
}

function onRandomizeComponent(idStr: string) {
    return async () => {
        await randomizeComponentModel(idStr);
        await randomizeComponentTexture(idStr);
        await previewCustomItem();
        await reloadComponentModels();
        await reloadComponentTextures();
    }
}

function onHardRandomizeComponent(idStr: string) {
    return async () => {
        await hardRandomizeComponentModel(idStr);
        await hardRandomizeComponentTexture(idStr);
        await previewCustomItem();
        await reloadComponentModels();
        await reloadComponentTextures();
    }
}