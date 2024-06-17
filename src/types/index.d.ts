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
    ItemFeatureFlags: { [key: number]: string}
    Item: { [key: string]: number}
    ComponentSections: { [key: number]: string}
    GeoSets: { [key: number]: GeoSetData}
}

declare interface GeoSetData
{
    title: string;
    options: GeoSetDataOption[];
}

declare interface GeoSetDataOption
{
    name: string;
    value: number;
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
    applyItemPatch: (name: string) => Promise<PatchResult>
    setupConfig: (wowPath: string, startWoWAfterPatch: boolean) => Promise<void>
}

declare interface DbApi {
    all: (query: string, ...params: any[]) => Promise<DbResponse>
    exec: (query: string) => Promise<DbResponse>
    get: (query: string, ...params: any[]) => Promise<DbResponse>
}

declare interface ElectronIpcRenderer {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
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
    }

    interface JQueryStatic {
        LoadingOverlay: (type: LoadingOverlayActionType, args?: Partial<JqueryLoadingOverlayOptions>|boolean|string) => void
        LoadingOverlaySetup: (options: Partial<JqueryLoadingOverlayOptions>) => void
    }
}
