export interface ItemToDisplayIdData {
    itemId: number;
    inventoryType: number;
    itemName: string;
    itemDisplayId: number
};

export interface ModelResourceData {
    fileName: string, 
    filePath: string,
    fileId: number,
    displayId: number,
    modelResourceId: number,
    raceId: number,
    genderId: number,
    extraData: number
}

export interface TextureFileData {
    fileName: string, 
    fileId: number,
    filePath: string,
    genderId: number,
    raceId: number,
    classId: number,
    materialResourceId: number,
}

export interface IconFileData {
    fileId: number;
    fileName: string;
}

export interface DbResponse<T> {
    error?: Error,
    result?: T
  }