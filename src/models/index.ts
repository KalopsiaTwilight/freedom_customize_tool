export * from "./db"
export * from "./item"
export * from "./patching"

export interface AppDataStore {
    freedomWoWRootDir: string;
    launchWoWAfterPatch: boolean;
}