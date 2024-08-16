/*!
    Based on code from:

    wow.export (https://github.com/Kruithne/wow.export)
    Authors: Kruithne <kruithne@gmail.com>
    License: MIT
 */

import util from 'node:util'
import * as utils from '../utils';
import BufferWrapper from '../buffer';
import { replaceExtension } from './exportHelper';
import { BuildCache } from './buildCache';

export const ListFileCacheFileName = 'listfile';
const nameLookup = new Map<string, number>();
const idLookup = new Map<number, string>();

let loaded = false;

/**
 * Load listfile for the given build configuration key.
 * Returns the amount of file ID to filename mappings loaded.
 * @param {string} buildConfig
 * @param {BuildCache} cache
 * @param {Map} rootEntries
 */
export const loadListfile = async (buildConfig: string, cache: BuildCache, rootEntries: Map<number, unknown>, source?: string) => {
    if (!source) {
        source = 'https://github.com/wowdev/wow-listfile/releases/latest/download/community-listfile.csv';
    }
    if (typeof source !== 'string')
        throw new Error('Source for the listfile must be a valid string!');

    // Replace optional buildID wildcard.
    if (source.includes('%s'))
        source = util.format(source, buildConfig);

    idLookup.clear();
    nameLookup.clear();

    let data;
    if (source.startsWith('http')) {
        // Listfile URL is http, check for cache/updates.
        let requireDownload = false;
        const cached = await cache.getFile(ListFileCacheFileName);

        if (cache.meta.lastListfileUpdate) {
            let ttl = 3 * 24 * 60 * 60 * 1000; // Reduce from days to milliseconds.

            if (ttl === 0 || (Date.now() - cache.meta.lastListfileUpdate) > ttl || cached === null) {
                requireDownload = true;
            }
        } else {
            // This listfile has never been updated.
            requireDownload = true;
        }

        if (requireDownload) {
            try {
                const fallback_url = "https://www.kruithne.net/wow.export/data/listfile/master?v=%s";
                data = await utils.downloadFile([source, fallback_url]);

                cache.storeFile(ListFileCacheFileName, data);

                cache.meta.lastListfileUpdate = Date.now();
                cache.saveManifest();
            } catch (e) {
                if (cached === null)
                    throw new Error('Failed to download listfile, no cached version for fallback');

                data = cached;
            }
        } else {
            data = cached;
        }
    } else {
        data = await BufferWrapper.readFile(source);
    }

    // Parse all lines in the listfile.
    // Example: 53187;sound/music/citymusic/darnassus/druid grove.mp3
    const lines = data.readLines();
    for (const line of lines) {
        if (line.length === 0)
            continue;

        const tokens = line.split(';');

        if (tokens.length !== 2) {
            return;
        }

        const fileDataID = Number(tokens[0]);
        if (isNaN(fileDataID)) {
            return;
        }

        if (rootEntries.has(fileDataID)) {
            const fileName = tokens[1].toLowerCase();
            idLookup.set(fileDataID, fileName);
            nameLookup.set(fileName, fileDataID);
        }
    }

    if (idLookup.size === 0) {
        return;
    }

    loaded = true;
    return idLookup.size;
}

// /**
//  * Load unknown files from TextureFileData/ModelFileData.
//  * Must be called after DBTextureFileData/DBModelFileData have loaded.
//  */
// export const loadUnknowns = async () => {
//     const unkBlp = await loadIDTable(DBTextureFileData.getFileDataIDs(), '.blp');
//     const unkM2 = await loadIDTable(DBModelFileData.getFileDataIDs(), '.m2');
// };

/**
 * Load file IDs from a data table.
 * @param {Set} ids
 * @param {string} ext 
 */
export const loadIDTable = async (ids: Set<number>, ext: string) => {
    let loadCount = 0;

    for (const fileDataID of ids) {
        if (!idLookup.has(fileDataID)) {
            const fileName = 'unknown/' + fileDataID + ext;
            idLookup.set(fileDataID, fileName);
            nameLookup.set(fileName, fileDataID);
            loadCount++;
        }
    }

    return loadCount;
};

/**
 * Return an array of filenames ending with the given extension(s).
 * @param {string|Array} exts 
 * @returns {Array}
 */
export const getFilenamesByExtension = (exts: string | string[]) => {
    // Box into an array for reduced code.
    if (!Array.isArray(exts))
        exts = [exts];

    let entries = [];

    for (const [fileDataID, filename] of idLookup.entries()) {
        for (const ext of exts) {
            if (Array.isArray(ext)) {
                if (filename.endsWith(ext[0]) && !filename.match(ext[1])) {
                    entries.push(fileDataID);
                    continue;
                }
            } else {
                if (filename.endsWith(ext)) {
                    entries.push(fileDataID);
                    continue;
                }
            }
        }
    }

    return formatEntries(entries);
};

/**
 * Sort and format listfile entries for file list display.
 * @param {Array} entries 
 * @returns {Array}
 */
export const formatEntries = (entries: number[]) => {
    entries.sort((a, b) => a - b);
    const result = entries.map(e => getByIDOrUnknown(e));
    return result;
};

export const ingestIdentifiedFiles = (entries: [number, string][]) => {
    for (const [fileDataID, ext] of entries) {
        const fileName = 'unknown/' + fileDataID + ext;
        idLookup.set(fileDataID, fileName);
        nameLookup.set(fileName, fileDataID);
    }
};

/**
 * Returns a full listfile, sorted and formatted.
 * @returns {Array}
 */
export const getFullListfile = () => {
    return formatEntries([...idLookup.keys()]);
};

/**
 * Get a filename from a given file data ID.
 * @param {number} id 
 * @returns {string|undefined}
 */
export const getByID = (id: number) => {
    return idLookup.get(id);
};

/**
 * Get a filename from a given file data ID or format it as an unknown file.
 * @param {number} id 
 * @param {string} [ext]
 * @returns {string}
 */
export const getByIDOrUnknown = (id: number, ext = '') => {
    return idLookup.get(id) ?? formatUnknownFile(id, ext);
};

/**
 * Get a file data ID by a given file name.
 * @param {string} filename
 * @returns {number|undefined} 
 */
export const getByFilename = (filename: string) => {
    let lookup = nameLookup.get(filename.toLowerCase().replace(/\\/g, '/'));

    // In the rare occasion we have a reference to an MDL/MDX file and it fails
    // to resolve (as expected), attempt to resolve the M2 of the same name.
    if (!lookup && (filename.endsWith('.mdl') || filename.endsWith('mdx')))
        lookup = nameLookup.get(replaceExtension(filename, '.m2').replace(/\\/g, '/'));

    return lookup;
};

/**
 * Returns an array of listfile entries filtered by the given search term.
 * @param {string|RegExp} search 
 * @returns {Array.<object>}
 */
export const getFilteredEntries = (search: string | RegExp) => {
    const results = [];
    const isRegExp = search instanceof RegExp;

    for (const [fileDataID, fileName] of idLookup.entries()) {
        if (isRegExp ? fileName.match(search) : fileName.includes(search))
            results.push({ fileDataID, fileName });
    }

    return results;
};

/**
 * Strips a prefixed file ID from a listfile entry.
 * @param {string} entry 
 * @returns {string}
 */
export const stripFileEntry = (entry: string) => {
    if (typeof entry === 'string' && entry.includes(' ['))
        return entry.substring(0, entry.lastIndexOf(' ['));

    return entry;
};

/**
 * Returns a file path for an unknown fileDataID.
 * @param {number} fileDataID 
 * @param {string} [ext]
 */
export const formatUnknownFile = (fileDataID: number, ext = '') => {
    return 'unknown/' + fileDataID + ext;
};

/**
 * Returns true if a listfile has been loaded.
 * @returns {boolean}
 */
export const isLoaded = () => {
    return loaded;
};