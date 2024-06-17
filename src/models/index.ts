import { ItemData } from "./item";

export * from "./db"
export * from "./item"
export * from "./patching"

export interface AppDataStore {
    freedomWoWRootDir: string;
    launchWoWAfterPatch: boolean;
    itemData: ItemData;
    previewCharacter: CharacterModelData;
}

export interface CharacterModelData {
    race: number;
    gender: number;
    customizations: { optionId: number, choiceId: number }[]
}
