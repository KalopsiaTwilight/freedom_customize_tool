import { WoWModelViewer } from "../pages/item/wow-model-viewer"
import { AppDataStore, DbResponse, PatchResult } from "../models"

declare interface WoWHeadConfig {
    debug?: (...data: any[]) => void;
    defaultAnimation?: string;
    Wow?: WoWDataCollection;
    WebP?: WebpOptions;
}

declare interface WebpOptions 
{
    getImageExtension(): string;
}

declare interface WoWDataCollection 
{
    Item: { 
        INVENTORY_TYPE_BACK: number;
        INVENTORY_TYPE_BAG: number;
        INVENTORY_TYPE_CHEST: number;
        INVENTORY_TYPE_FEET: number;
        INVENTORY_TYPE_FINGER: number;
        INVENTORY_TYPE_HANDS: number;
        INVENTORY_TYPE_HEAD: number;
        INVENTORY_TYPE_HELD_IN_OFF_HAND: number;
        INVENTORY_TYPE_LEGS: number;
        INVENTORY_TYPE_MAIN_HAND: number;
        INVENTORY_TYPE_NECK: number;
        INVENTORY_TYPE_OFF_HAND: number;
        INVENTORY_TYPE_ONE_HAND: number;
        INVENTORY_TYPE_PROFESSION_ACCESSORY: number;
        INVENTORY_TYPE_PROFESSION_TOOL: number;
        INVENTORY_TYPE_PROJECTILE: number;
        INVENTORY_TYPE_QUIVER: number;
        INVENTORY_TYPE_RANGED: number;
        INVENTORY_TYPE_RANGED_RIGHT: number;
        INVENTORY_TYPE_RELIC: number;
        INVENTORY_TYPE_ROBE: number;
        INVENTORY_TYPE_SHIELD: number;
        INVENTORY_TYPE_SHIRT: number;
        INVENTORY_TYPE_SHOULDERS: number;
        INVENTORY_TYPE_TABARD: number;
        INVENTORY_TYPE_THROWN: number;
        INVENTORY_TYPE_TRINKET: number;
        INVENTORY_TYPE_TWO_HAND: number;
        INVENTORY_TYPE_WAIST: number;
        INVENTORY_TYPE_WRISTS: number;
    }
}

declare type LoadingOverlayActionType = "show" | "hide" | "resize" | "text" | "progress"

declare interface JqueryLoadingOverlayOptions {
    // Background
    background              : string      
    backgroundClass         : string|boolean
    // Image
    image                   : string|boolean
    imageAnimation          : string|boolean
    imageAutoResize         : boolean
    imageResizeFactor       : number
    imageColor              : string|number[]|boolean
    imageClass              : string|boolean
    imageOrder              : number
    // Font Awesome
    fontawesome             : string|boolean
    fontawesomeAnimation    : string|boolean
    fontawesomeAutoResize   : boolean
    fontawesomeResizeFactor : number
    fontawesomeColor        : string|boolean
    fontawesomeOrder        : number
    // Custom
    custom                  : string|boolean
    customAnimation         : string|boolean
    customAutoResize        : boolean
    customResizeFactor      : number
    customOrder             : number
    // Text
    text                    : string|boolean
    textAnimation           : string|boolean
    textAutoResize          : boolean
    textResizeFactor        : number
    textColor               : string|boolean
    textClass               : string|boolean
    textOrder               : number
    // Progress
    progress                : boolean
    progressAutoResize      : boolean
    progressResizeFactor    : number
    progressColor           : string|boolean
    progressClass           : string|boolean
    progressOrder           : number
    progressFixedPosition   : string|boolean
    progressSpeed           : number
    progressMin             : number
    progressMax             : number
    // Sizing
    size                    : number|string|boolean
    minSize                 : number|string
    maxSize                 : number|string
    // Misc
    direction               : string
    fade                    : number[]|boolean|number|string
    resizeInterval          : number
    zIndex                  : number
}

declare interface ElectronApi {
    getExpressAppUrl: () => Promise<string>
    applyItemPatch: () => Promise<void>
    setupConfig: (wowPath: string, startWoWAfterPatch: boolean) => Promise<void>
    selectFolder: () => Promise<string[] | undefined>
    selectFile: (filters: Electron.FileFilter[] = []) => Promise<string[] | undefined>
    openLogFile: () => Promise<void>
    setMenuItemDisabled: (menuIndex: number, itemIndex: number, disabled = true) => Promise<void>
    loadFile: (path: string) => Promise<string>
    convertToWebp: (data: string) => Promise<string>
    convertToPng: (data: string) => Promise<string>
    colorizeImg: (data: string, hue = 0, brightness = 0, saturation = 0, lightness = 0) => Promise<string>;
}

declare interface DbApi {
    all<T>(query: string, ...params: any[]): Promise<DbResponse<T[]>>
    exec: (query: string) => Promise<DbResponse<unknown>>
    get<T>(query: string, ...params: any[]): Promise<DbResponse<T>>
}

declare interface ElectronIpcRenderer {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    off: (channel: string) => void;
}

type StoreApiKey = keyof AppDataStore;
declare interface StoreApi {
    get<Key extends keyof AppDataStore>(key: Key): Promise<AppDataStore[Key]>,
    set<Key extends keyof AppDataStore>(key: StoreApiKey, obj: AppDataStore[Key]): Promise<void>
}

declare global {
    interface Window {
        jQuery: any
        $: any
        CONTENT_PATH: string
        EXPRESS_URI: string
        WOTLK_TO_RETAIL_DISPLAY_ID_API: string
        WH: WoWHeadConfig
        model: WoWModelViewer
        api: ElectronApi
        db: DbApi
        store: StoreApi
        ipcRenderer: ElectronIpcRenderer
        ZamModelViewer?: class
    }

    interface JQueryStatic {
        LoadingOverlay: (type: LoadingOverlayActionType, args?: Partial<JqueryLoadingOverlayOptions>|boolean|string) => void
        LoadingOverlaySetup: (options: Partial<JqueryLoadingOverlayOptions>) => void
    }
}
