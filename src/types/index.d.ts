import { WoWModelViewer } from "../app/wow-model-viewer"

declare interface WoWHeadConfig {
    debug?: (...data: any[]) => void;
    defaultAnimation?: string;
    Wow?: WoWDataCollection;
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
}

declare interface ElectronIpcRenderer {
    on: (channel: string, listener: (event: any, ...args: any[]) => void);
}

declare global {
    interface Window {
        jQuery: any
        $: any
        CONTENT_PATH: string
        WOTLK_TO_RETAIL_DISPLAY_ID_API: string
        WH: WoWHeadConfig
        model: WoWModelViewer
        models: ZamModelViewerInitData
        api: ElectronApi
        ipcRenderer: ElectronIpcRenderer
    }

    interface JQueryStatic {
        LoadingOverlay: (type: LoadingOverlayActionType, args?: Partial<JqueryLoadingOverlayOptions>|boolean|string) => void
        LoadingOverlaySetup: (options: Partial<JqueryLoadingOverlayOptions>) => void
    }
}