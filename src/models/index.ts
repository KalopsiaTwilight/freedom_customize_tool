import { ItemData } from "./item";

export * from "./db"
export * from "./item"
export * from "./patching"

export interface AppDataStore {
    itemData: ItemData;
    settings: AppSettings;
}

export interface AppSettings
{
    freedomWoWRootDir: string;
    launchWoWAfterPatch: boolean;
    previewCharacter: CharacterModelData;
    useDarkMode: boolean;
}

export interface CharacterModelData {
    race: number;
    gender: number;
    customizations: { optionId: number, choiceId: number }[]
}
