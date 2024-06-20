export interface ItemMaterialData {
    fileName: string;
    fileId: number;
    gender: number;
    race: number;
    class: number;
}

export interface ItemComponentModelModelData extends ItemMaterialData {
    extraData: number;
}

export interface ItemComponentModelData {
    texture: {
        id: number;
        name: string;
    }
    models: ItemComponentModelModelData[];
}

export interface ItemGeoSetData {
    group: number;
    race: number;
}

export interface GenderedItemGeoSetData extends ItemGeoSetData {
    gender: number;
}

export interface ItemMaterialContainer {
    [key:string]: ItemMaterialData[]
}

export interface ItemComponentModelContainer {
    [key: string]: ItemComponentModelData
}

export interface ItemData {
    name: string,
    inventoryType: number,
    itemMaterials: ItemMaterialContainer
    itemComponentModels: ItemComponentModelContainer
    particleColors: number[][]
    helmetGeoVisMale: ItemGeoSetData[]
    helmetGeoVisFemale: ItemGeoSetData[]
    flags: number
    geoSetGroup: number[]
}