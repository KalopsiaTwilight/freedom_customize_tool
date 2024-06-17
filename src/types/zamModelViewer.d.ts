declare class ZamModelViewer {
    renderer?: ZamRenderer
    method?: (methodName: string, ...args: any[]) => void;
    destroy: () => void;
    async constructor(data: ZamModelViewerInitData)
}

declare class ZamRenderer {
    models: any[]
    distance?: number;
    azimuth?: number;
    zenith?: number;
}

declare interface ZamCharacterData {
    HairStyleOptionId: number;
    Materials: ZamCharacterMaterialsData[];
    Options: ZamCharacterCustomizationOptionData[];
    TextureFiles: { [key: number]: ZamFileData };
    TextureLayers: any[];
    TextureSections: any[]
}

declare interface ZamCharacterMaterialsData {
    Flags: number;
    Height: number;
    TextureType: number;
    Unk_34615_1: number;
    Width: number;
}

declare interface ZamCharacterCustomizationOptionData {
    Id: number;
    Name: string;
    OrderIndex: number;
    Choices: ZamCharacterCustomizationOptionChoiceData[];
}

declare interface ZamCharacterCustomizationOptionChoiceData {
    Id: number;
    Name: string;
    OrderIndex: number;
    CustReqId: number;
    Elements: any[];
}

declare interface ZamFileData {
    Class: number;
    ExtraData: number;
    FileDataId: number;
    Gender: number;
    Race: number;
}

declare interface ZamModelViewerCharacterInitData {
    items?: number[][];
    charCustomization?: {
        options: { optionId: number, choiceId: number }[]
    }
    models: {
        id: number;
        type: number;
    }
}

declare interface ZamModelViewerInitData extends ZamModelViewerCharacterInitData {
    type: number;
    contentPath: string;
    container: Jquery<HTMLElement>;
    aspect: number;
    hd: boolean;
}

declare interface ZamItemGeoSetData {
    RaceId: number
    GeosetGroup: number
    RaceBitSelection?: number
}

declare interface ZamItemParticleColorData {
    Id: number
    Start: number[]
    Mid: number[]
    End: number[]
}

declare interface ZamItemData {
    Model: number,
    Textures: { [key: string]: number; } | null
    Textures2: { [key: string]: number; } | null
    TextureFiles: { [key: string]: ZamFileData[] }
    ModelFiles: { [key: string]: ZamFileData[] }
    Item: {
        Flags: number
        InventoryType: number
        ItemClass: number
        ItemSubClass: number,
        HideGeosetMale: ZamItemGeoSetData[] | null
        HideGeosetFemale: ZamItemGeoSetData[] | null
        GeosetGroup: number[]
        AttachGeosetGroup: number[]
        GeosetGroupOverride: number,
        ParticleColor: ZamItemParticleColorData | null
    },
    Creature: null,
    Character: null,
    ItemEffects: null,
    Equipment: null,
    ComponentTextures: { [key: string]: number }
    ComponentModels: { [key: string]: number }
    StateKit: null,
    StateKits: null,
    Scale: number;
}