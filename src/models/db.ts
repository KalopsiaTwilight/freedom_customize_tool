export interface ItemToDisplayIdData {
    itemId: number;
    inventoryType: number;
    itemName: string;
    itemDisplayId: number
};

export interface ModelResourceData {
    fileName: string, 
    fileId: number
}

export interface TextureFileData {
    fileName: string, 
    fileId: number
}

export interface DbResponse {
    error?: Error,
    result?: unknown
  }