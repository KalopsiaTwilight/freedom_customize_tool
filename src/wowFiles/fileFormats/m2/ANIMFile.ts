import BufferWrapper from "../../buffer";

const CHUNK_AFM2 = 0x324D4641;
const CHUNK_AFSA = 0x41534641;
const CHUNK_AFSB = 0x42534641;

export class ANIMFile {
    animData: number[];
    boneData: number[];
    attachmentData: number[];

    static deserialize(buffer: BufferWrapper, chunked: boolean) {
        const file = new ANIMFile();
        if (!chunked) {
            file.animData = buffer.readUInt8(buffer.remainingBytes);
        } else {
            while(buffer.remainingBytes > 0) {
                const chunkID = buffer.readUInt32LE();
                const chunkSize = buffer.readUInt32LE();
                const nextChunkPos = buffer.offset + chunkSize;
        
                switch (chunkID) {
                    case CHUNK_AFM2: file.animData = buffer.readUInt8(chunkSize); break;
                    case CHUNK_AFSA: file.attachmentData = buffer.readUInt8(chunkSize);  break; 
                    case CHUNK_AFSB: file.boneData = buffer.readUInt8(chunkSize); ; break;
                }
        
                buffer.seek(nextChunkPos);
            }
        }
        return file;
    }
}