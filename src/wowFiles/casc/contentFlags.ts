/*!
    Based on code from:
	
	wow.export (https://github.com/Kruithne/wow.export)
	Authors: Kruithne <kruithne@gmail.com>, Marlamin <marlamin@marlamin.com>
	License: MIT
 */

export enum ContentFlag {
	LoadOnWindows = 0x8,
	LoadOnMacOS = 0x10,
	LowViolence = 0x80,
	DoNotLoad = 0x100,
	UpdatePlugin = 0x800,
	Encrypted = 0x8000000,
	NoNameHash = 0x10000000,
	UncommonResolution = 0x20000000,
	Bundle = 0x40000000,
	NoCompression = 0x80000000
}