import { Tooltip } from "bootstrap";

import { debounce, inventoryTypeToName } from "../../utils";
import { CharacterModelData, InventoryType } from "../../models";
import { OnOpenChannel, OnSaveChannel } from "../../ipc/channels";

import { onInventorySlotChange } from "./item-inventoryslot";
import { onSearchTexture, onSubmitSectionTextureUpload, reloadTextures } from "./item-texture";
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
import { onSubmitColorize, updateColorizePreview } from "./shared";


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
    $("#ci_item_search").on("keyup", debounce(() => {
        $("#ci_preview_page").val(0);
        onSearchItem();
    }));

    $("#setParticleOverride").on("click", onSetParticleColors);
    $("#addHelmetGeoVis").on("click", onAddGeoSetOverride);

    $("#ci_model_gender").on("change", onModelGenderChange)
    $("#ci_model_race").on("change", onModelRaceChange)

    $("#randomizeItemBtn").on("click", onRandomizeItem)

    $("#btnRandomizeComponent1").on("click", onRandomizeComponent("0"));
    $("#btnHardRandomizeComponent1").on("click", onHardRandomizeComponent("0"));
    $("#btnClearComponent1").on("click", onClearComponent("0"));
    
    $("#btnRandomizeComponent2").on("click", onRandomizeComponent("1"));
    $("#btnHardRandomizeComponent2").on("click", onHardRandomizeComponent("1"));
    $("#btnClearComponent2").on("click", onClearComponent("1"))


    $("#ci_texture_inventorySlotFilter").on('change', () => {
        $("#ci_preview_page").val(0);
        onSearchTexture();
    })
    $("#ci_item_inventorySlotFilter").on('change', () => {
        $("#ci_preview_page").val(0);
        onSearchItem();
    })
    $("#ci_componentmodel_inventorySlotFilter").on('change', () => {
        $("#ci_preview_page").val(0);
        onSearchComponentModel();
    })
    $("#ci_componenttexture_inventorySlotFilter").on('change', () => {
        $("#ci_preview_page").val(0);
        onSearchComponentTexture();
    })
    $("#ci_itemIcon_inventorySlotFilter").on('change', () => {
        $("#ci_preview_page").val(0);
        onSearchItemMetadata();
    })


    $("#ci_texture_componentsectionFilter").on('change', () => {
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

    $("#btnLoadExisting").on('click', () => {
        $("#ci_preview_page").val(0);
        onSearchItem();
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

    $("#ci_ctexture_selectFileBtn").on('click', async () => {
        const files = await window.api.selectFile([ {
            'extensions': ['png'],
            'name': 'PNG files'
        }]);
        if (!files) {
            return;
        }
        $("#ci_ctexture_file").val(files[0]);
        $("#uploadCustomTextureBtn").removeAttr('disabled');
    })

    $("#uploadCustomTextureBtn").on('click', onSubmitSectionTextureUpload);

    $("#ci_hst_hue, #ci_hst_brightness, #ci_hst_saturation, #ci_hst_lightness").on("change", function () {
        $("#" + this.id + "_text").val($(this).val())
        updateColorizePreview();
    });
    $("#ci_hst_hue_text, #ci_hst_brightness_text, #ci_hst_saturation_text, #ci_hst_lightness_text").on("change", function () {
        $("#" + this.id.slice(0, -5)).val($(this).val())
        updateColorizePreview();
    });
    $("#colorizeTexture").on("click", onSubmitColorize);

    
    new Tooltip($("#btnEditItemIcon")[0], { title: 'Edit' });
    new Tooltip($("#btnSoftRandomizeItemIcon")[0], { title: 'Soft Randomize' });
    new Tooltip($("#btnHardRandomizeItemIcon")[0], { title: 'Hard Randomize' });
    new Tooltip($("#btnClearItemIcon")[0], { title: 'Remove'})

    window.ipcRenderer.on(OnSaveChannel, exportToFile);
    window.ipcRenderer.on(OnOpenChannel, loadFile);
}

export function unload() {
    $(window).off("resize", windowResizeFn);
    window.ipcRenderer.off(OnSaveChannel);
    window.ipcRenderer.off(OnOpenChannel);
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
    reloadItemSlotDropdownFilters(inventorySlot);
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
        $.LoadingOverlay("show");
        await randomizeComponentModel(idStr);
        await randomizeComponentTexture(idStr);
        await previewCustomItem();
        await reloadComponentModels();
        await reloadComponentTextures();
        $.LoadingOverlay("hide");
    }
}

function onHardRandomizeComponent(idStr: string) {
    return async () => {
        $.LoadingOverlay("show");
        await hardRandomizeComponentModel(idStr);
        await hardRandomizeComponentTexture(idStr);
        await previewCustomItem();
        await reloadComponentModels();
        await reloadComponentTextures();
        $.LoadingOverlay("hide");
    }
}

function reloadItemSlotDropdownFilters(inventoryType: InventoryType) {
    const filterTargets = [
        "#ci_texture_inventorySlotFilter",
        "#ci_item_inventorySlotFilter",
        "#ci_componentmodel_inventorySlotFilter",
        "#ci_componenttexture_inventorySlotFilter",
        "#ci_itemIcon_inventorySlotFilter"
    ]

    for(const target of filterTargets) {
        $(target).empty();
        $(target).append('<option value="-1"></option>');
        const currentItemOption = `<option value="${inventoryType}">${inventoryTypeToName(inventoryType)}</option>`;
        $(target).append(currentItemOption);
        for(const val in InventoryType) {
            const inventoryTypeId = parseInt(val, 10);
            if (isNaN(inventoryTypeId) || inventoryTypeId === inventoryType) {
                continue;
            }
            $(target).append(`<option value='${inventoryTypeId}'>${inventoryTypeToName(inventoryTypeId)}</option>`)
        }
    }
}