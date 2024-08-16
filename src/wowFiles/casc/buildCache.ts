/*!
    Based on code from:
    
    wow.export (https://github.com/Kruithne/wow.export)
    Authors: Kruithne <kruithne@gmail.com>
    License: MIT
 */

import path from "node:path";
import EventEmitter from "node:events"
import fsp from "node:fs/promises"
import BufferWrapper from "../buffer";
import * as utils from "../utils";

const cacheEvents = new EventEmitter();

export type BuildCacheIntegrity = {
    [key: string]: string;
}
let cacheIntegrity: BuildCacheIntegrity;

export const CacheIntegrityReadyEvent = 'cache-integrity-ready';
/**
 * Returns a promise that resolves once cache integrity is available.
 */
export const cacheIntegrityReady = async () => {
    return new Promise<void>(res => {
        // Cache integrity already available.
        if (cacheIntegrity)
            return res();
        
        cacheEvents.once(CacheIntegrityReadyEvent, res);
    });
};

export interface BuildCacheMeta {
    lastAccess?: number;
    lastListfileUpdate?: number
}

export const BuildCacheIntegrityFileName = 'cacheintegrity';

export class BuildCache {
    key: string;
    meta: BuildCacheMeta;
    cacheDir?: string;
    manifestPath?: string;

    /**
     * Construct a new BuildCache instance.
     * @param {string} key 
     */
    constructor(key: string, cacheDir?: string, manifestPath?: string) {
        this.key = key;
        this.meta = {};

        this.cacheDir = cacheDir;
        this.manifestPath = manifestPath;

        this.loadCacheIntegrity();
    }

    /**
     * Initialize the build cache instance.
     */
    async init() {
        // Create cache directory if needed.
        if (this.cacheDir) {
            await fsp.mkdir(this.cacheDir, { recursive: true });
        }

        // Load manifest values.
        if (this.manifestPath) {
            try {
                const manifest = JSON.parse(await fsp.readFile(this.manifestPath, 'utf8'));
                Object.assign(this.meta, manifest);
            } catch (e) {
    
            }
        }

        // Save access update without blocking.
        this.meta.lastAccess = Date.now();
        this.saveManifest();
    }

    /**
     * Attempt to get a file from this build cache.
     * Returns NULL if the file is not cached.
     * @param {string} file File path relative to build cache.
     * @param {string} dir Optional override directory.
     */
    async getFile(file: string, dir?: string) {
        try {
            const filePath = this.getFilePath(file, dir);

            // Cache integrity is not loaded yet, wait for it.
            if (!cacheIntegrity)
                await cacheIntegrityReady();

            const integrityHash = cacheIntegrity[filePath];

            // File integrity cannot be verified, reject.
            if (typeof integrityHash !== 'string') {
                return null;
            }

            const data = await BufferWrapper.readFile(filePath);
            const dataHash = data.calculateHash('sha1', 'hex');

            // Reject cache if hash does not match.
            if (dataHash !== integrityHash) {
                return null;
            }

            return data;
        } catch (e) {
            return null;
        }
    }

    /**
     * Get a direct path to a cached file.
     * @param {string} file File path relative to build cache.
     * @param {string} dir Optional override directory.
     */
    getFilePath(file: string, dir?: string) {
        if (dir || this.cacheDir) {
            return path.join(dir || this.cacheDir, file);
        }
        return file;
    }

    /**
     * Store a file in this build cache.
     * @param {string} file File path relative to build cache.
     * @param {BufferWrapper} data Data to store in the file.
     * @param {string} dir Optional override directory.
     */
    async storeFile(file: string, data: BufferWrapper, dir?: string) {
        if (!(data instanceof BufferWrapper))
            throw new Error('Data provided to cache.storeFile() must be of BufferWrapper type.');

        const filePath = this.getFilePath(file, dir);
        if (dir)
            await utils.createDirectory(path.dirname(filePath));

        // Cache integrity is not loaded yet, wait for it.
        if (!cacheIntegrity)
            await cacheIntegrityReady();

        // Integrity checking.
        const hash = data.calculateHash('sha1', 'hex');
        cacheIntegrity[filePath] = hash;

        if (this.cacheDir || dir) {
            await fsp.writeFile(filePath, data.raw);
        }


        await this.saveCacheIntegrity();
    }

    /**
     * Save the cache integrity to disk.
     */
    async saveCacheIntegrity() {
        if (this.cacheDir) {
            await fsp.writeFile(this.getIntegrityFilePath(), JSON.stringify(cacheIntegrity), 'utf8');
        }
    }

    /**
     * Save the manifest for this build cache.
     */
    async saveManifest() {
        if (this.manifestPath) {
            await fsp.writeFile(this.manifestPath, JSON.stringify(this.meta), 'utf8');
        }
    }

    getIntegrityFilePath() {
        if (this.cacheDir) {
            return path.join(this.cacheDir, BuildCacheIntegrityFileName);
        }
        return undefined;
    }

    // Initialize cache integrity system.
    async loadCacheIntegrity() {
        try {
            const integrity = await utils.readJSON<BuildCacheIntegrity>(this.getIntegrityFilePath(), false);
            if (integrity === null)
                throw new Error('File cannot be accessed or contains malformed JSON: ' + this.getIntegrityFilePath());

            cacheIntegrity = integrity;
        } catch (e) {
            cacheIntegrity = {};
        }

        cacheEvents.emit(CacheIntegrityReadyEvent);
    }
}