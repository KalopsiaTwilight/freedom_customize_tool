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
    modelResourceId: number
}

export interface TextureFileData {
    fileName: string, 
    fileId: number
}

export interface DbResponse<T> {
    error?: Error,
    result?: T
  }