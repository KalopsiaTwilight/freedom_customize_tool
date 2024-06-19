import { debounce } from "../../utils";
import { CharacterModelData } from "../../models";

import { onInventorySlotChange } from "./item-inventoryslot";
import { onAddTexture, onSearchTexture, reloadTextures } from "./item-texture";
import { exportToFile, loadFile, loadItem, onRandomizeItem, onSearchItem } from "./item-loading";
import { onAddComponentTexture, onRandomizeComponent1Texture, onRandomizeComponent2Texture, onSearchComponentTexture, reloadComponentTextures } from "./item-component-textures";
import { onRandomizeComponent1Model, onRandomizeComponent2Model, onSearchComponentModel, reloadComponentModels } from "./item-component-models";
import { onSetParticleColors, reloadParticleColorComponents } from "./item-particle-colors";
import { onAddGeoSetOverride, reloadHelmetGeovisComponents } from "./item-helmet-geovis";
import { reloadFlagsComponents } from "./item-feature-flags";
import { reloadGeosetDisplay } from "./item-geoset-display";
import { onModelGenderChange, onModelRaceChange, reloadCharacterModel } from "./character-model";

let windowResizeFn: () => void;

export default async function load() {
    const itemData = await window.store.get('itemData');
    $("#ci_name").val(itemData.name);
    $("#ci_name").on("change", async () => { 
        const itemData = await window.store.get('itemData');
        itemData.name = $("#ci_name").val().toString();
        await window.store.set("itemData", itemData);
    }) 

    $("#ci_inventoryslot").on("change", onInventorySlotChange);

    $("#ci_texture_textureFile").on("keyup", debounce(onSearchTexture));
    $("#addTextureBtn").on("click", onAddTexture);

    $("#ci_item_search").on("keyup", debounce(onSearchItem));
    $("#loadItemBtn").on("click", loadItem);

    $("#component1AddModelBtn").on("click", function () {
        $("#ci_component_id").val("0")
        $("#ci_componentmodel_modelfile").val("");
        onSearchComponentModel();
    });
    $("#component1AddTextureBtn").on("click", function () {
        $("#ci_component_id").val("0")
    });
    $("#component2AddModelBtn").on("click", function () {
        $("#ci_component_id").val("1")
        $("#ci_componentmodel_modelfile").val("");
        onSearchComponentModel();
    });
    $("#component2AddTextureBtn").on("click", function () {
        $("#ci_component_id").val("1")
    });

    $("#ci_componenttexture_file").on("keyup", debounce(() => {
        $("#ci_preview_page").val(0);
        onSearchComponentTexture();
    }));
    $("#ci_componentmodel_modelfile").on("keyup", debounce(() => {
        $("#ci_preview_page").val(0);
        onSearchComponentModel();
    }));

    $("#addComponentTextureBtn").on("click", onAddComponentTexture);

    $("#setParticleOverride").on("click", onSetParticleColors);

    $("#addHelmetGeoVis").on("click", onAddGeoSetOverride);

    $("#exportBtn").on("click", exportToFile);
    $("#loadFileBtn").on("click", loadFile);

    $("#ci_model_gender").on("change", onModelGenderChange)
    $("#ci_model_race").on("change", onModelRaceChange)

    $("#randomizeItemBtn").on("click", onRandomizeItem)

    $("#component1RandomizeModelBtn").on("click", onRandomizeComponent1Model);
    $("#component2RandomizeModelBtn").on("click", onRandomizeComponent2Model);
    $("#component1RandomizeTextureBtn").on("click", onRandomizeComponent1Texture);
    $("#component2RandomizeTextureBtn").on("click", onRandomizeComponent2Texture);

    $("#patchWoWBtn").on("click", () => {
        $.LoadingOverlay("show");
        window.api.applyItemPatch();
    });

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

export function unload() {
    $(window).off("resize", windowResizeFn);
}

export async function reloadAllSections(inventorySlot: number) {
    $("#ci_inventoryslot").val(inventorySlot);
    await reloadGeosetDisplay();
    await reloadTextures();
    await reloadComponentModels();
    await reloadComponentTextures();
    await reloadParticleColorComponents();
    await reloadFlagsComponents();
    await reloadHelmetGeovisComponents();
}