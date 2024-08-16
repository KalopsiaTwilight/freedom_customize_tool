/*!
    Based on code from:
	
	wow.export (https://github.com/Kruithne/wow.export)
	Authors: Kruithne <kruithne@gmail.com>, Marlamin <marlamin@marlamin.com>
	License: MIT
 */

/**
 * CASC Locale Flags
 */

export enum LocaleFlag {
    enUS = 0x2,
    koKR = 0x4,
    frFR = 0x10,
    deDE = 0x20,
    zhCN = 0x40,
    esES = 0x80,
    zhTW = 0x100,
    enGB = 0x200,
    //enCN = 0x400,
    //enTW = 0x800,
    esMX = 0x1000,
    ruRU = 0x2000,
    ptBR = 0x4000,
    itIT = 0x8000,
    ptPT = 0x10000
}

export function localeFlagToName(flag: LocaleFlag)
{
    switch(flag)
    {
        case LocaleFlag.enUS: { return "American English [enUS]"; }
        case LocaleFlag.koKR: { return "한국어 [koKR]"; }
        case LocaleFlag.frFR: { return "Français [frFR]"; }
        case LocaleFlag.deDE: { return "Deutsch [deDE]"; }
        case LocaleFlag.zhCN: { return "简体中文 [zhCN]"; }
        case LocaleFlag.esES: { return "Español (España) [esES]"; }
        case LocaleFlag.zhTW: { return "繁體中文 [zhTW]"; }
        case LocaleFlag.enGB: { return "British English [enGB]"; }
        //case LocaleFlag.enCN: { return "Unknown [enCN]"; }
        //case LocaleFlag.enTW: { return "Unknown [enTW]"; }
        case LocaleFlag.esMX: { return "Español (América Latina) [esMX]"; }
        case LocaleFlag.ruRU: { return "Русский [ruRU]"; }
        case LocaleFlag.ptBR: { return "Português (Brasil) [ptBR]"; }
        case LocaleFlag.itIT: { return "Italiano [itIT]"; }
        case LocaleFlag.ptPT: { return "Português (Europeu) [ptPT]"; }
        default: { return "Unknown"; }
	}
}