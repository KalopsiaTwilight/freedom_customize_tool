import BufferWrapper from "../../buffer";
import { BIDAChunk, BOMTChunk, CHUNK_BOMT_ID, CHUNK_BIDA_ID, M2Chunk } from "./M2Chunks";

export class BONEFile {
    chunks: M2Chunk[]

    constructor() {
        this.chunks = [];
    }

    static deserialize(buffer: BufferWrapper) {
        const file = new BONEFile();
        buffer.readUInt32LE();
        while(buffer.remainingBytes > 0) {
            const chunkID = buffer.readUInt32LE();
            const chunkSize = buffer.readUInt32LE();
            const nextChunkPos = buffer.offset + chunkSize;
    
            switch (chunkID) {
                case CHUNK_BIDA_ID: file.chunks.push(BIDAChunk.deserialize(buffer, chunkSize)); break;
                case CHUNK_BOMT_ID: file.chunks.push(BOMTChunk.deserialize(buffer, chunkSize));  break; 
            }
    
            buffer.seek(nextChunkPos);
        }
        return file;
    }

    toWHOutput() {
        const bytesNeeded = this.chunks.reduce((acc, next) => this.getSize(next) + acc+8, 0);
        const buffer = BufferWrapper.alloc(bytesNeeded + 4);
        buffer.writeInt32LE(0);
        for(const chunk of this.chunks) {
            buffer.writeUInt32LE(chunk.type);
            buffer.writeUInt32LE(this.getSize(chunk))
            if (BIDAChunk.isBIDAChunk(chunk)) {
                for (const entry of chunk.boneIds) {
                    buffer.writeUInt16LE(entry);
                }
            } else if (BOMTChunk.isBOMTChunk(chunk)) {
                for (const entry of chunk.boneOffsetMatrices) {
                    for(const vector of entry.columns) {
                        buffer.writeFloatLE(vector.x)
                        buffer.writeFloatLE(vector.y)
                        buffer.writeFloatLE(vector.z)
                        buffer.writeFloatLE(vector.w)
                    }
                }
            }
        }
        return buffer;
    }

    getSize(chunk: M2Chunk) {
        if (BIDAChunk.isBIDAChunk(chunk)) {
            return chunk.boneIds.length * 2;
        } else if (BOMTChunk.isBOMTChunk(chunk)) {
            return chunk.boneOffsetMatrices.length * 64;
        }
        return 0;
    }
    
}