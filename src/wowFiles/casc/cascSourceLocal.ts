/*!
    Based on code from:
    
    wow.export (https://github.com/Kruithne/wow.export)
    Authors: Kruithne <kruithne@gmail.com>
    License: MIT
 */

import path from "node:path";
import fsp from "node:fs/promises";
import util from "node:util";
import { BLTEReader } from "./blteReader";
import BufferWrapper from "../buffer";
import { BuildCache } from "./buildCache";
import { CASC } from "./cascSource"
import CDNConfig from "./cdnConfig"
import constants from "../constants"
import * as utils from "../utils"
import parseVersionConfig from "./versionConfig";
import { LocaleFlag } from "./localeFlags";

export interface CASCIndexEntry {
    index: number,
    offset: number,
    size: number
}

export class CASCLocal extends CASC {
    dir: string;
    dataDir: string;
    storageDir: string;
    localIndexes: Map<string, CASCIndexEntry>;
    builds: { [key: string]: string }[];
    build: { [key: string]: string };


    /**
     * Create a new CASC source using a local installation.
     * @param {string} dir Installation path.
     */
    constructor(dir: string, locale: LocaleFlag) {
        super(locale);

        this.dir = dir;
        this.dataDir = path.join(dir, 'Data');
        this.storageDir = path.join(this.dataDir, 'data');

        this.localIndexes = new Map();
    }

    /**
     * Initialize local CASC source.
     */
    async init(configString?: string) {
        if (!configString) {
            const buildInfo = path.join(this.dir, '.build.info');
            configString = await fsp.readFile(buildInfo, 'utf8');
        }
        
        const config = parseVersionConfig(configString);
        // Filter known products.
        this.builds = config.filter(entry => constants.PRODUCTS.some(e => e.product === entry.Product));
    }

    /**
     * Obtain a file by it's fileDataID.
     * @param {number} fileDataID 
     * @param {boolean} [partialDecryption=false]
     * @param {boolean} [supportFallback=true]
     * @param {boolean} [forceFallback=false]
     * @param {string} [contentKey=null]
     */
    async getFile(fileDataID: number, partialDecryption = false, contentKey: string = null) {
        const encodingKey = contentKey !== null ? super.getEncodingKeyForContentKey(contentKey) : await this.getFileEncodingKey(fileDataID);
        const data = await this.getDataFile(encodingKey);
        return new BLTEReader(data, encodingKey, partialDecryption);
    }

    /**
     * Returns a list of available products in the installation.
     * Format example: "PTR: World of Warcraft 8.3.0.32272"
     */
    getProductList() {
        const products = [];
        for (const entry of this.builds) {
            const product = constants.PRODUCTS.find(e => e.product === entry.Product);
            products.push(util.format('%s (%s) %s', product.title, entry.Branch.toUpperCase(), entry.Version));
        }

        return products;
    }

    /**
     * Load the CASC interface with the given build.
     * @param {number} buildIndex
     */
    async load(buildIndex: number) {
        this.build = this.builds[buildIndex];

        this.cache = new BuildCache(this.build.BuildKey);
        await this.cache.init();

        await this.loadConfigs();
        await this.loadIndexes();
        await this.loadEncoding();
        await this.loadRoot();

        // TODO: Replace this?
        // await this.loadListfile(this.build.BuildKey);
    }

    /**
     * Load the BuildConfig from the installation directory.
     */
    async loadConfigs() {
        this.buildConfig = await this.getConfigFile(this.build.BuildKey);
        this.cdnConfig = await this.getConfigFile(this.build.CDNKey);
    }

    /** 
     * Get config from disk with CDN fallback 
     */
    async getConfigFile(key: string) {
        const configPath = this.formatConfigPath(key);
        return CDNConfig(await fsp.readFile(configPath, 'utf8'));
    }

    /**
     * Load and parse storage indexes from the local installation.
     */
    async loadIndexes() {
        let indexCount = 0;

        const entries = await fsp.readdir(this.storageDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.idx')) {
                await this.parseIndex(path.join(this.storageDir, entry.name));
                indexCount++;
            }
        }
    }

    /**
     * Parse a local installation journal index for entries.
     * @param {string} file Path to the index.
     */
    async parseIndex(file: string) {
        const entries = this.localIndexes;
        const index = await BufferWrapper.readFile(file);

        const headerHashSize = index.readInt32LE();
        index.move(4); // headerHash uint32
        index.move(headerHashSize); // headerHash byte[headerHashSize]

        index.seek((8 + headerHashSize + 0x0F) & 0xFFFFFFF0); // Next 0x10 boundary.

        const dataLength = index.readInt32LE();
        index.move(4);

        const nBlocks = dataLength / 18;
        for (let i = 0; i < nBlocks; i++) {
            const key = index.readHexString(9);
            if (entries.has(key)) {
                index.move(1 + 4 + 4); // idxHigh + idxLow + size
                continue;
            }

            const idxHigh = index.readUInt8();
            const idxLow = index.readInt32BE();

            entries.set(key, {
                index: (idxHigh << 2 | ((idxLow & 0xC0000000) >>> 30)),
                offset: idxLow & 0x3FFFFFFF,
                size: index.readInt32LE()
            });
        }
    }

    /**
     * Load and parse encoding from the local installation.
     */
    async loadEncoding() {
        const encKeys = this.buildConfig.encoding.split(' ');
        const encRaw = await this.getDataFile(encKeys[1]);
        await this.parseEncodingFile(encRaw, encKeys[1]);
    }

    /**
     * Load and parse root table from local installation.
     */
    async loadRoot() {
        // Get root key from encoding table.
        const rootKey = this.encodingKeys.get(this.buildConfig.root);
        if (rootKey === undefined)
            throw new Error('No encoding entry found for root key');

        const root = await this.getDataFile(rootKey);
        const rootEntryCount = await this.parseRootFile(root, rootKey);
    }

    /**
     * Obtain a data file from the local archives.
     * @param {string} key
     */
    async getDataFile(key: string) {
        const entry = this.localIndexes.get(key.substring(0, 18));
        if (!entry)
            throw new Error('Requested file does not exist in local data: ' + key);

        const data = await utils.readFile(this.formatDataPath(entry.index), entry.offset + 0x1E, entry.size - 0x1E);

        let isZeroed = true;
        for (let i = 0, n = data.remainingBytes; i < n; i++) {
            if (data.readUInt8() !== 0x0) {
                isZeroed = false;
                break;
            }
        }

        if (isZeroed)
            throw new Error('Requested data file is empty or missing: ' + key);

        data.seek(0);
        return data;
    }

    /**
     * Format a local path to a data archive.
     * 67 -> <install>/Data/data/data.067
     * @param {number} id 
     */
    formatDataPath(id: number) {
        return path.join(this.dataDir, 'data', 'data.' + id.toString().padStart(3, '0'));
    }

    /**
     * Format a local path to an archive index from the key.
     * 0b45bd2721fd6c86dac2176cbdb7fc5b -> <install>/Data/indices/0b45bd2721fd6c86dac2176cbdb7fc5b.index
     * @param {string} key 
     */
    formatIndexPath(key: string) {
        return path.join(this.dataDir, 'indices', key + '.index');
    }

    /**
     * Format a local path to a config file from the key.
     * 0af716e8eca5aeff0a3965d37e934ffa -> <install>/Data/config/0a/f7/0af716e8eca5aeff0a3965d37e934ffa
     * @param {string} key 
     */
    formatConfigPath(key: string) {
        return path.join(this.dataDir, 'config', this.formatCDNKey(key));
    }

    /**
     * Format a CDN key for use in local file reading.
     * Path separators used by this method are platform specific.
     * 49299eae4e3a195953764bb4adb3c91f -> 49\29\49299eae4e3a195953764bb4adb3c91f
     * @param {string} key 
     */
    formatCDNKey(key: string) {
        return path.join(key.substring(0, 2), key.substring(2, 4), key);
    }

    /**
    * Get the current build ID.
    * @returns {string}
    */
    getBuildName() {
        return this.build.Version;
    }

    /**
     * Returns the build configuration key.
     * @returns {string}
     */
    getBuildKey() {
        return this.build.BuildKey;
    }
}