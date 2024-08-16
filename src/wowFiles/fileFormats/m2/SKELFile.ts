import { M2Attachment, M2CompBone, M2Loop, M2Sequence } from "./M2Types";
import * as M2Chunks from "./M2Chunks";
import BufferWrapper from "../../buffer";
import log from "electron-log";

export class SKELFile {
    /* SKL1 */
    /** Uint32 */
    flags: number;
    name: string;
    /** Uint8[] */ 
    unkArray1: [number, number, number, number];

    /* SKA1 */
    attachments: M2Attachment[];
    /** Uint16 */
    attachmentLookupTable: number[];

    /* SKB1 */
    bones: M2CompBone[];
    /** Uint16 */
    keyBoneLookup: number[];

    /* SKS1 */
    globalLoops: M2Loop[];
    sequences: M2Sequence[];
    /** UInt16 */
    sequenceLookups: number[];
    unkArray2: [number, number, number, number, number, number, number, number];

    /* SKPD */
    unkArray3: [number, number, number, number, number, number, number, number];
    /** Uint32 */
    parentSkeletonFileId: number;
    unkArray4: [number, number, number, number];

    /* AFID */
    animFileIds: M2Chunks.AnimationFileEntry[];
    /* BFID */
    boneFileDataIds: number[];

    deserialize(buffer: BufferWrapper) {
        let fileOffset = 0;
        while (buffer.remainingBytes > 0) {
            const chunkID = buffer.readUInt32LE();
            const chunkSize = buffer.readUInt32LE();
            const nextChunkPos = buffer.offset + chunkSize;

            switch (chunkID) {
                case M2Chunks.CHUNK_SKL1_ID: {
                    fileOffset = buffer.offset;
                    this.deserializeChunk_SKL1(buffer); break;
                }
                case M2Chunks.CHUNK_SKA1_ID: {
                    this.deserializeChunk_SKA1(buffer, fileOffset); break;
                }
                case M2Chunks.CHUNK_SKB1_ID: {
                    this.deserializeChunk_SKB1(buffer, fileOffset); break;
                }
                case M2Chunks.CHUNK_SKS1_ID: {
                    this.deserializeChunk_SKS1(buffer, fileOffset); break;
                }
                case M2Chunks.CHUNK_SKPD_ID: {
                    this.deserializeChunk_SKPD(buffer); break;
                }
                case M2Chunks.CHUNK_AFID_ID: this.deserializeChunk_AFID(buffer, chunkSize); break;
                case M2Chunks.CHUNK_BFID_ID: this.deserializeChunk_BFID(buffer, chunkSize); break;
                default: {
                    log.debug("[SKELFile] skipped chunk: ", chunkID)
                }
            }

            // Ensure that we start at the next chunk exactly.
            buffer.seek(nextChunkPos);
        }
    }
    deserializeChunk_SKL1(buffer: BufferWrapper) {
        const chunkData = M2Chunks.SKL1Chunk.deserialize(buffer);
        this.flags = chunkData.flags;
        this.name = chunkData.name;
        this.unkArray1 = chunkData.unkArray1;
    }
    deserializeChunk_SKA1(buffer: BufferWrapper, fileOffset: number) {
        const chunkData = M2Chunks.SKA1Chunk.deserialize(buffer, buffer.offset, this.sequences);
        this.attachments = chunkData.attachments;
        this.attachmentLookupTable = chunkData.attachmentLookupTable;
    }
    deserializeChunk_SKB1(buffer: BufferWrapper, fileOffset: number) {
        const chunkData = M2Chunks.SKB1Chunk.deserialize(buffer, buffer.offset, this.sequences);
        this.bones = chunkData.bones;
        this.keyBoneLookup = chunkData.keyBoneLookup;
    }
    deserializeChunk_SKS1(buffer: BufferWrapper, fileOffset: number) {
        const chunkData = M2Chunks.SKS1Chunk.deserialize(buffer,  buffer.offset);
        this.globalLoops = chunkData.globalLoops;
        this.sequences = chunkData.sequences;
        this.sequenceLookups = chunkData.sequenceLookups;
    }
    deserializeChunk_SKPD(buffer: BufferWrapper) {
        const chunkData = M2Chunks.SKPDChunk.deserialize(buffer);
        this.parentSkeletonFileId = chunkData.parentSkeletonFileId;
        this.unkArray3 = chunkData.unkArray3;
        this.unkArray4 = chunkData.unkArray4;
    }
    deserializeChunk_AFID(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.AFIDChunk.deserialize(buffer, chunkSize);
        this.animFileIds = chunkData.entries;
    }
    deserializeChunk_BFID(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.BFIDChunk.deserialize(buffer, chunkSize);
        this.boneFileDataIds = chunkData.boneFileDataIDs;
    }
}