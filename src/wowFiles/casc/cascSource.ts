/*!
    Based on code from:
    
    wow.export (https://github.com/Kruithne/wow.export)
    Authors: Kruithne <kruithne@gmail.com>, Marlamin <marlamin@marlamin.com>
    License: MIT
 */

import { BLTEReader } from "./blteReader";
import BufferWrapper from "../buffer";
import { ContentFlag } from "./contentFlags";
import { LocaleFlag } from "./localeFlags";
import * as listfile from "./listFile"
import InstallManifest from "./installManifest";
import { BuildCache } from "./buildCache";

const ENC_MAGIC = 0x4E45;
const ROOT_MAGIC = 0x4D465354;

export abstract class CASC {
    locale: LocaleFlag;
    rootEntries: Map<number, Map<number, string>>;
    rootTypes: { contentFlags: ContentFlag, localeFlags: LocaleFlag }[];
    encodingKeys: Map<string, string>
    encodingSizes: Map<string, number>
    listfile: unknown
    buildConfig: { [key: string]: string };
    cdnConfig: unknown;
    cache: BuildCache;

    constructor(locale: LocaleFlag) {
        this.encodingSizes = new Map();
        this.encodingKeys = new Map();
        this.rootTypes = [];
        this.rootEntries = new Map();
        this.locale = locale;
    }

    /**
     * Provides an array of fileDataIDs that match the current locale.
     * @returns {Array.<number>}
     */
    getValidRootEntries() {
        const entries = [];

        for (const [fileDataID, entry] of this.rootEntries.entries()) {
            let include = false;

            for (const rootTypeIdx of entry.keys()) {
                const rootType = this.rootTypes[rootTypeIdx];
                if ((rootType.localeFlags & this.locale) && ((rootType.contentFlags & ContentFlag.LowViolence) === 0)) {
                    include = true;
                    break;
                }
            }

            if (include)
                entries.push(fileDataID);
        }

        return entries;
    }

    /**
     * Retrieves the install manifest for this CASC instance.
     * @returns {InstallManifest}
     */
    async getInstallManifest() {
        const installKeys = this.buildConfig.install.split(' ');
        const installKey = installKeys.length === 1 ? this.encodingKeys.get(installKeys[0]) : installKeys[1];

        const raw = await this.getDataFile(this.formatCDNKey(installKey))
        const manifest = new BLTEReader(raw, installKey);

        return new InstallManifest(manifest);
    }

    abstract getDataFile(key: string): Promise<BufferWrapper>;
    abstract formatCDNKey(key: string): string;

    /**
     * Obtain a file by it's fileDataID.
     * @param {number} fileDataID 
     */
    abstract getFile(fileDataID: number, partialDecryption?: boolean, contentKey?: string): Promise<BLTEReader>;

    /**
     * Obtain a file by it's fileDataID.
     * @param {number} fileDataID 
     */
    async getFileEncodingKey(fileDataID: number) {
        const root = this.rootEntries.get(fileDataID);
        if (root === undefined)
            throw new Error('fileDataID does not exist in root: ' + fileDataID);

        let contentKey = null;
        for (const [rootTypeIdx, key] of root.entries()) {
            const rootType = this.rootTypes[rootTypeIdx];

            // Select the first root entry that has a matching locale and no LowViolence flag set.
            if ((rootType.localeFlags & this.locale) && ((rootType.contentFlags & ContentFlag.LowViolence) === 0)) {
                contentKey = key;
                break;
            }
        }

        if (contentKey === null)
            throw new Error('No root entry found for locale: ' + this.locale);

        const encodingKey = this.encodingKeys.get(contentKey);
        if (encodingKey === undefined)
            throw new Error('No encoding entry found: ' + contentKey);

        // This underlying implementation returns the encoding key rather than a
        // data file, allowing CASCLocal and CASCRemote to implement readers.
        return encodingKey;
    }

    /**
     * @param {string} contentKey 
     * @returns {string}
     */
    getEncodingKeyForContentKey(contentKey: string) {
        const encodingKey = this.encodingKeys.get(contentKey);
        if (encodingKey === undefined)
            throw new Error('No encoding entry found: ' + contentKey);

        // This underlying implementation returns the encoding key rather than a
        // data file, allowing CASCLocal and CASCRemote to implement readers.
        return encodingKey;
    }

    /**
     * Obtain a file by a filename.
     * fileName must exist in the loaded listfile.
     * @param {string} fileName 
     * @param {boolean} [partialDecrypt=false]
     * @param {boolean} [suppressLog=false]
     * @param {boolean} [supportFallback=true]
     * @param {boolean} [forceFallback=false]
     */
    async getFileByName(fileName: string, partialDecrypt = false, contentKey: string = null) {
        let fileDataID;

        // If filename is "unknown/<fdid>", skip listfile lookup
        if (fileName.startsWith("unknown/") && !fileName.includes('.'))
            fileDataID = parseInt(fileName.split('/')[1]);
        else
            fileDataID = listfile.getByFilename(fileName);

        if (fileDataID === undefined)
            throw new Error('File not mapping in listfile: ' + fileName);

        return await this.getFile(fileDataID, partialDecrypt, contentKey);
    }

    /**
     * Load the listfile for selected build.
     * @param {string} buildKey 
     */
    async loadListfile(buildKey: string) {
        const entries = await listfile.loadListfile(buildKey, this.cache, this.rootEntries);
        if (entries === 0)
            throw new Error('No listfile entries found');
    }

    /**
     * Parse entries from a root file.
     * @param {BufferWrapper} data 
     * @param {string} hash 
     * @returns {number}
     */
    async parseRootFile(data: BufferWrapper, hash: string) {
        const root = new BLTEReader(data, hash);

        const magic = root.readUInt32LE();
        const rootTypes = this.rootTypes;
        const rootEntries = this.rootEntries;

        if (magic == ROOT_MAGIC) { // 8.2
            let totalFileCount = root.readUInt32LE();
            let namedFileCount = root.readUInt32LE();

            // TEMP FIX: If total file count is very low, we're dealing with a post-10.1.7 root format.
            if (totalFileCount < 100) {
                // The already read values totalFileCount and namedFileCount are now headerSize and version respectively.
                // However, since we already read those we just reread the proper file counts for now.
                totalFileCount = root.readUInt32LE();
                namedFileCount = root.readUInt32LE();
                root.readUInt32LE(); // Padding?
            }

            const allowNamelessFiles = totalFileCount !== namedFileCount;

            while (root.remainingBytes > 0) {
                const numRecords = root.readUInt32LE();

                const contentFlags = root.readUInt32LE();
                const localeFlags = root.readUInt32LE();

                const fileDataIDs = new Array(numRecords);

                let fileDataID = 0;
                for (let i = 0; i < numRecords; i++) {
                    const nextID = fileDataID + root.readInt32LE();
                    fileDataIDs[i] = nextID;
                    fileDataID = nextID + 1;
                }

                // Parse MD5 content keys for entries.
                for (let i = 0; i < numRecords; i++) {
                    const fileDataID = fileDataIDs[i];
                    let entry = rootEntries.get(fileDataID);

                    if (!entry) {
                        entry = new Map();
                        rootEntries.set(fileDataID, entry);
                    }

                    entry.set(rootTypes.length, root.readHexString(16));
                }

                // Skip lookup hashes for entries.
                if (!(allowNamelessFiles && contentFlags & ContentFlag.NoNameHash))
                    root.move(8 * numRecords);

                // Push the rootType after parsing the block so that
                // rootTypes.length can be used for the type index above.
                rootTypes.push({ contentFlags, localeFlags });
            }
        } else { // Classic
            root.seek(0);
            while (root.remainingBytes > 0) {
                const numRecords = root.readUInt32LE();

                const contentFlags = root.readUInt32LE();
                const localeFlags = root.readUInt32LE();

                const fileDataIDs = new Array(numRecords);

                let fileDataID = 0;
                for (let i = 0; i < numRecords; i++) {
                    const nextID = fileDataID + root.readInt32LE();
                    fileDataIDs[i] = nextID;
                    fileDataID = nextID + 1;
                }

                // Parse MD5 content keys for entries.
                for (let i = 0; i < numRecords; i++) {
                    const key = root.readHexString(16);
                    root.move(8); // hash

                    const fileDataID = fileDataIDs[i];
                    let entry = rootEntries.get(fileDataID);

                    if (!entry) {
                        entry = new Map();
                        rootEntries.set(fileDataID, entry);
                    }

                    entry.set(rootTypes.length, key);
                }

                // Push the rootType after parsing the block so that
                // rootTypes.length can be used for the type index above.
                rootTypes.push({ contentFlags, localeFlags });
            }
        }

        return rootEntries.size;
    }

    /**
     * Parse entries from an encoding file.
     * @param {BufferWrapper} data 
     * @param {string} hash 
     * @returns {object}
     */
    async parseEncodingFile(data: BufferWrapper, hash: string) {
        const encodingSizes = this.encodingSizes;
        const encodingKeys = this.encodingKeys;

        const encoding = new BLTEReader(data, hash);

        const magic = encoding.readUInt16LE();
        if (magic !== ENC_MAGIC)
            throw new Error('Invalid encoding magic: ' + magic);

        encoding.move(1); // version
        const hashSizeCKey = encoding.readUInt8();
        const hashSizeEKey = encoding.readUInt8();
        const cKeyPageSize = encoding.readInt16BE() * 1024;
        encoding.move(2); // eKeyPageSize
        const cKeyPageCount = encoding.readInt32BE();
        encoding.move(4 + 1); // eKeyPageCount + unk11
        const specBlockSize = encoding.readInt32BE();

        encoding.move(specBlockSize + (cKeyPageCount * (hashSizeCKey + 16)));

        const pagesStart = encoding.offset;
        for (let i = 0; i < cKeyPageCount; i++) {
            const pageStart = pagesStart + (cKeyPageSize * i);
            encoding.seek(pageStart);

            while (encoding.offset < (pageStart + pagesStart)) {
                const keysCount = encoding.readUInt8();
                if (keysCount === 0)
                    break;

                const size = encoding.readInt40BE();
                const cKey = encoding.readHexString(hashSizeCKey);

                encodingSizes.set(cKey, size);
                encodingKeys.set(cKey, encoding.readHexString(hashSizeEKey));

                encoding.move(hashSizeEKey * (keysCount - 1));
            }
        }
    }
}