import { CharacterModelData } from "../../models";

import { findRaceGenderOptions, WowModelViewer } from "./wow-model-viewer"
import { previewCustomItem } from "./preview-item"

export async function reloadCharacterModel(character: CharacterModelData) {
    if (window.model) {
        window.model.destroy();
    }

    const fullCharOptions = await findRaceGenderOptions(character.race, character.gender);

    const options = [];
    for (const opt of fullCharOptions.Options) {
        const i = character.customizations.findIndex((x) => x.optionId === opt.Id);
        if (i > -1) {
            options.push(character.customizations[i]);
        } else {
            options.push({
                optionId: opt.Id,
                choiceId: opt.Choices[0].Id
            })
        }
    }

    const modelData: ZamModelViewerInitData = {
        type: 2,
        contentPath: window.CONTENT_PATH,
        container: $("#model_3d"),
        aspect: ($("#model_3d").width() / 600),
        hd: true,
        items: [],
        charCustomization: {
            options
        },
        models: {
            id: character.race * 2 - 1 + character.gender,
            type: 16
        }
    }
    window.model = new WowModelViewer(modelData);
    await previewCustomItem();
}

export async function onModelRaceChange() {
    const character: CharacterModelData = {
        race: parseInt($("#ci_model_race").val().toString(), 10),
        gender: parseInt($("#ci_model_gender").val().toString(), 10),
        customizations: [],
    }
    await reloadCharacterModel(character);
}

export async function onModelGenderChange() {
    const character: CharacterModelData = {
        race: parseInt($("#ci_model_race").val().toString(), 10),
        gender: parseInt($("#ci_model_gender").val().toString(), 10),
        customizations: [],
    }
    await reloadCharacterModel(character);
}