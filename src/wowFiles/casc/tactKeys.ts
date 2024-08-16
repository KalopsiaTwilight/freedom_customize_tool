/*!
    Based on code from:
	
	wow.export (https://github.com/Kruithne/wow.export)
	Authors: Kruithne <kruithne@gmail.com>
	License: MIT
 */

import { get } from "../utils";

const KEY_RING: {[key: string]: string} = {};

/**
 * Retrieve a registered decryption key.
 * @param {string} keyName 
 */
export const getKey = (keyName: string) => {
    return KEY_RING[keyName.toLowerCase()];
};
    
/**
 * Validate a keyName/key pair.
 * @param {string} keyName 
 * @param {string} key 
 */
const validateKeyPair = (keyName: string, key: string) => {
    if (keyName.length !== 16)
        return false;

    if (key.length !== 32)
        return false;

    return true;
};
    
/**
 * Add a decryption key. Subject to validation.
 * Decryption keys will be saved to disk on next tick.
 * Returns true if added, else false if the pair failed validation.
 * @param {string} keyName 
 * @param {string} key 
 */
export const addKey = (keyName: string, key: string) => {
    if (!validateKeyPair(keyName, key))
        return false;

    keyName = keyName.toLowerCase();
    key = key.toLowerCase();

    if (KEY_RING[keyName] !== key) {
        KEY_RING[keyName] = key;
    }

    return true;
};
    
/**
 * Load tact keys from disk cache and request updated
 * keys from remote server.
 */
export const load = async () => {
    const tact_url = 'https://raw.githubusercontent.com/wowdev/TACTKeys/master/WoW.txt';
    const tact_url_fallback = 'https://www.kruithne.net/wow.export/data/tact/wow';

    const res = await get([tact_url, tact_url_fallback]);
    if (!res.ok)
        throw new Error(`Unable to update tactKeys, HTTP ${res.status}`);

    const data = await res.text();
    const lines = data.split(/\r\n|\n|\r/);
    for (const line of lines) {
        const parts = line.split(' ');
        if (parts.length !== 2)
            continue;

        const keyName = parts[0].trim();
        const key = parts[1].trim();

        if (validateKeyPair(keyName, key)) {
            KEY_RING[keyName.toLowerCase()] = key.toLowerCase();
        }
    }
};