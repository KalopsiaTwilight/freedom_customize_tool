import BufferWrapper from "../../buffer";
import { C2Vector, C3Vector, C44Matrix, CAxisAlignedBox, CImVector } from "../commonTypes";
import * as M2Types from "./M2Types";

export abstract class M2Chunk {
    type: number;
    constructor(type: number) {
        this.type = type;
    }
}

export enum MD21ChunkFlags {
    None = 0x00,
    TiltX = 0x01,
    TiltY = 0x02,
    Unk_0x04 = 0x04,
    UseTextureCombinerCombos = 0x08,
    Unk_0x10 = 0x10,
    LoadPhysData = 0x20,
    Unk_0x40 = 0x40,
    Unk_0x80 = 0x80,
    CameraRelated = 0x100,
    NewParticleRecord = 0x200,
    Unk_0x400 = 0x400,
    TextureTransformsUseBoneSequences = 0x800,
    Unk_0x1000 = 0x1000,
    ChunkedAnimFiles = 0x2000,
    Unk_0x4000 = 0x4000,
    Unk_0x8000 = 0x8000,
    Unk_0x10000 = 0x10000,
    Unk_0x20000 = 0x20000,
    Unk_0x40000 = 0x40000,
    Unk_0x80000 = 0x80000,
    Unk_0x100000 = 0x100000,
    Unk_0x200000 = 0x200000,
}

export const CHUNK_MD21_ID = 0x3132444D

export class MD21Chunk extends M2Chunk {
    /** uint32_t */
    magic: number;
    /** uint32_t */
    version: number;
    name: string;
    /** uint32_t */
    flags: MD21ChunkFlags;
    globalLoops: M2Types.M2Loop[];
    sequences: M2Types.M2Sequence[];
    /** uint16_t[] */
    sequenceIdxHashById: number[];
    bones: M2Types.M2CompBone[];
    /** uint16_t[] */
    boneIndicesById: number[];
    vertices: M2Types.M2Vertex[];
    /** uint32_t */
    numSkinProfiles: number;
    colors: M2Types.M2Color[];
    textures: M2Types.M2Texture[];
    textureWeights: M2Types.M2TextureWeight[];
    textureTransforms: M2Types.M2TextureTransform[];
    /** int16_t[] */
    textureIndicesById: number[];
    materials: M2Types.M2Material[];
    /** uint16_t */
    boneCombos: number[];
    /** uint16_t[] */
    textureCombos: number[];
    /** uint16_t[] */
    textureCoordCombos: number[];
    /** uint16_t[] */
    textureWeightCombos: number[];
    /** uint16_t[] */
    textureTransformCombos: number[];
    boundingBox: CAxisAlignedBox;
    /** float */
    boundingSphereRadius: number;
    collisionBox: CAxisAlignedBox;
    /** float */
    collisionSphereRadius: number;
    /** uint16_t[] */
    collisionIndices: number[];
    collisionPosition: C3Vector[];
    collisionFaceNormals: C3Vector[];
    attachments: M2Types.M2Attachment[];
    /** uint16_t[] */
    attachmentIndicesById: number[];
    events: M2Types.M2Event[];
    lights: M2Types.M2Light[];
    cameras: M2Types.M2Camera[];
    /** uint16_t[] */
    cameraIndicesById: number[];
    ribbonEmitters: M2Types.M2Ribbon[];
    particleEmitters: M2Types.M2ParticleEmitter[];
    /** uint16_t[] */
    textureCombinerCombos: number[];

    constructor() {
        super(CHUNK_MD21_ID);
    }

    hasFlag(flag: MD21ChunkFlags) {
        return (this.flags & flag) === flag;
    }

    static deserialize(buffer: BufferWrapper) {

        var chunk = new MD21Chunk();
        const fileOffset = buffer.offset;

        const magic = buffer.readUInt32LE();
        if (magic !== 0x3032444D)
            throw new Error('Invalid M2 magic: ' + magic);

        chunk.magic = magic;
        chunk.version = buffer.readUInt32LE();
        chunk.name = M2Types.deserializeM2String(buffer, fileOffset);
        chunk.flags = buffer.readUInt32LE();
        chunk.globalLoops = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Loop.deserialize);
        chunk.sequences = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Sequence.deserialize);
        chunk.sequenceIdxHashById = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.bones = M2Types.deserializeM2Array(buffer, fileOffset, (buff2, offs2) => {
            return M2Types.M2CompBone.deserialize(buff2, offs2, chunk.sequences)
        });
        chunk.boneIndicesById = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.vertices = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Vertex.deserialize);
        chunk.numSkinProfiles = buffer.readUInt32LE();
        chunk.colors = M2Types.deserializeM2Array(buffer, fileOffset, 
            (buff2, i) => M2Types.M2Color.deserialize(buff2, i, chunk.sequences)
        );
        chunk.textures = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Texture.deserialize);
        chunk.textureWeights = M2Types.deserializeM2Array(buffer, fileOffset, 
            (buff2, i) => M2Types.M2TextureWeight.deserialize(buff2, i, chunk.sequences)
        );
        chunk.textureTransforms = M2Types.deserializeM2Array(buffer, fileOffset, 
            (buff2, i) =>  M2Types.M2TextureTransform.deserialize(buff2, i, chunk.sequences)
        );
        chunk.textureIndicesById = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.materials = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Material.deserialize);
        chunk.boneCombos = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.textureCombos = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.textureCoordCombos = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.textureWeightCombos = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.textureTransformCombos = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.boundingBox = CAxisAlignedBox.deserialize(buffer);
        chunk.boundingSphereRadius = buffer.readFloatLE();
        chunk.collisionBox = CAxisAlignedBox.deserialize(buffer);
        chunk.collisionSphereRadius = buffer.readFloatLE();
        chunk.collisionIndices = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.collisionPosition = M2Types.deserializeM2Array(buffer, fileOffset, C3Vector.deserialize);
        chunk.collisionFaceNormals = M2Types.deserializeM2Array(buffer, fileOffset, C3Vector.deserialize);
        chunk.attachments = M2Types.deserializeM2Array(buffer, fileOffset,
            (buff2, i) =>   M2Types.M2Attachment.deserialize(buff2, i, chunk.sequences)
        );
        chunk.attachmentIndicesById = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.events = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Event.deserialize);
        chunk.lights = M2Types.deserializeM2Array(buffer, fileOffset,
            (buff2, i) =>  M2Types.M2Light.deserialize(buff2, i, chunk.sequences)
        );
        chunk.cameras = M2Types.deserializeM2Array(buffer, fileOffset,
            (buff2, i) =>  M2Types.M2Camera.deserialize(buff2, i, chunk.sequences)
        );
        chunk.cameraIndicesById = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        chunk.ribbonEmitters = M2Types.deserializeM2Array(buffer, fileOffset,
            (buff2, i) =>   M2Types.M2Ribbon.deserialize(buff2, i, chunk.sequences)
        );
        chunk.particleEmitters = M2Types.deserializeM2Array(buffer, fileOffset,
            (buff2, i) => M2Types.M2ParticleEmitter.deserialize(buff2, i, chunk.sequences)
        );
        if (chunk.hasFlag(MD21ChunkFlags.UseTextureCombinerCombos)) {
            chunk.textureCombinerCombos = M2Types.deserializeM2Array(buffer, fileOffset, (buff2) => buff2.readInt16LE());
        } else {
            chunk.textureCombinerCombos = [];
        }
        return chunk;
    }
}

export const CHUNK_PFID_ID = 0x44494650;

export class PFIDChunk extends M2Chunk {
    /** uint32_t */
    physFileId: number;
    constructor() {
        super(CHUNK_PFID_ID);
    }
    static deserialize(buffer: BufferWrapper) {
        const result = new PFIDChunk();
        result.physFileId = buffer.readUInt32LE();
        return result;
    }
}

export const CHUNK_SFID_ID = 0x44494653;

export class SFIDChunk extends M2Chunk {
    /** uint32_t */
    skinFileDataIDs: number[];
    /** uint32_t */
    lodSkinFileDataIDs: number[];
    constructor() {
        super(CHUNK_SFID_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number, numSkinProfiles: number) {
        const result = new SFIDChunk();

        const lodSkinCount = (chunkSize / 4) - numSkinProfiles;
        result.skinFileDataIDs = new Array(numSkinProfiles);
        result.lodSkinFileDataIDs = new Array(lodSkinCount);

        for (let i = 0; i < numSkinProfiles; i++)
            result.skinFileDataIDs[i] = buffer.readUInt32LE();

        for (let i = 0; i < lodSkinCount; i++)
            result.lodSkinFileDataIDs[i] = buffer.readUInt32LE();

        return result;
    }
}

export const CHUNK_AFID_ID = 0x44494641;
export interface AnimationFileEntry {
    /* uint16_t **/
    animId: number;
    /* uint16_t **/
    subAnimId: number;
    /* uint32_t **/
    fileId: number;
}
export class AFIDChunk extends M2Chunk {
    entries: AnimationFileEntry[];

    constructor() {
        super(CHUNK_AFID_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const entryCount = chunkSize / 8;
        const result = new AFIDChunk();
        result.entries = new Array(entryCount);
        for (let i = 0; i < entryCount; i++) {
            result.entries[i] = {
                animId: buffer.readUInt16LE(),
                subAnimId: buffer.readUInt16LE(),
                fileId: buffer.readUInt32LE()
            }
        }
        return result;
    }
}

export const CHUNK_BFID_ID = 0x44494642;
export class BFIDChunk extends M2Chunk {
    /** uint32_t[] */
    boneFileDataIDs: number[];
    constructor() {
        super(CHUNK_BFID_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const entryCount = chunkSize / 4;
        const result = new BFIDChunk();
        result.boneFileDataIDs = new Array(entryCount);
        for (let i = 0; i < entryCount; i++) {
            result.boneFileDataIDs[i] = buffer.readUInt32LE()
        }
        return result;
    }
}

export const CHUNK_TXAC_ID = 0x43415854;

export class TXACChunk extends M2Chunk {
    /** char */
    entries: [number, number][]
    constructor() {
        super(CHUNK_TXAC_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const entryCount = chunkSize / 2;
        const result = new TXACChunk();
        result.entries = new Array(entryCount);
        for (let i = 0; i < entryCount; i++) {
            result.entries[i] = [buffer.readUInt8(), buffer.readUInt8()]
        }
        return result;
    }
}

export const CHUNK_EXPT_ID = 0x54505845;
export class EXPTChunkEntry {
    /** float */
    zSource: number;
    /** float */
    colorMult: number;
    /** float */
    alphaMult: number;

    toExtendedParticle() {
        const particle = new M2Types.M2ExtendedParticle();
        particle.alphaMult = this.alphaMult;
        particle.colorMult = this.colorMult;
        particle.zSource = this.zSource;
        particle.alphaCutoff = new M2Types.M2Dict()
        return particle;
    }
}
export class EXPTChunk extends M2Chunk {
    entries: EXPTChunkEntry[];
    constructor() {
        super(CHUNK_EXPT_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const entryCount = chunkSize / 12;
        const result = new EXPTChunk();
        result.entries = new Array(entryCount);
        for (let i = 0; i < entryCount; i++) {
            result.entries[i] = new EXPTChunkEntry();
            result.entries[i].zSource = buffer.readFloatLE();
            result.entries[i].colorMult = buffer.readFloatLE();
            result.entries[i].alphaMult = buffer.readFloatLE();
        }
        return result;
    }
}

export const CHUNK_EXP2_ID = 0x32505845;
export class EXP2Chunk extends M2Chunk {
    entries: M2Types.M2ExtendedParticle[];

    constructor() {
        super(CHUNK_EXP2_ID);
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new EXP2Chunk();
        result.entries = M2Types.deserializeM2Array(buffer, buffer.offset, M2Types.M2ExtendedParticle.deserialize);
        return result;
    }
}

export const CHUNK_PABC_ID = 0x43424150;
export class PABCChunk extends M2Chunk {
    /** uint16_t */
    replacementParentSequenceLookups: number[];

    constructor() {
        super(CHUNK_PABC_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const entryCount = chunkSize / 2;
        const result = new PABCChunk();
        result.replacementParentSequenceLookups = new Array(entryCount);
        for (let i = 0; i < entryCount; i++) {
            result.replacementParentSequenceLookups[i] = buffer.readUInt16LE();
        }
        return result;
    }
}

export const CHUNK_PADC_ID = 0x43444150;
export class PADCChunk extends M2Chunk {
    entries: M2Types.M2TextureWeight[];

    constructor() {
        super(CHUNK_PADC_ID);
    }

    static deserialize(buffer: BufferWrapper, startingOffset: number, textureWeights: number, sequences: M2Types.M2Sequence[]) {
        const result = new PADCChunk();
        result.entries = new Array(textureWeights);
        for (let i = 0; i < textureWeights; i++) {
            result.entries[i] = M2Types.M2TextureWeight.deserialize(buffer, startingOffset, sequences)
        }
        return result;
    }
}

export const CHUNK_PSBC_ID = 0x43425350;
export class PSBCChunk extends M2Chunk {
    parentSequenceBounds: M2Types.M2Bounds[];

    constructor() {
        super(CHUNK_PSBC_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new PSBCChunk();
        
        result.parentSequenceBounds = M2Types.deserializeM2Array(buffer, buffer.offset, M2Types.M2Bounds.deserialize);
        // const entryCount = chunkSize / (7 * 4);
        // result.parentSequenceBounds = new Array(entryCount);
        // for (let i = 0; i < entryCount; i++) {
        //     result.parentSequenceBounds[i] = M2Types.M2Bounds.deserialize(buffer)
        // }
        return result;
    }
}

export const CHUNK_PEDC_ID = 0x43444550;
export class PEDCChunk extends M2Chunk {
    parentEventData: M2Types.M2TrackBase[];

    constructor() {
        super(CHUNK_PEDC_ID);
    }
}

export const CHUNK_SKID_ID = 0x44494B53;
export class SKIDChunk extends M2Chunk {
    /** uint32_t */
    skeletonFileID: number;

    constructor() {
        super(CHUNK_SKID_ID);
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new SKIDChunk();
        result.skeletonFileID = buffer.readUInt32LE();
        return result;
    }
}

export const CHUNK_TXID_ID = 0x44495854;
export class TXIDChunk extends M2Chunk {
    /** uint32_t */
    fileDataIDs: number[];

    constructor() {
        super(CHUNK_TXID_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new TXIDChunk();
        const numEntries = chunkSize / 4;
        result.fileDataIDs = new Array(numEntries);
        for (let i = 0; i < numEntries; i++) {
            result.fileDataIDs[i] = buffer.readUInt32LE();

        }
        return result;
    }
}

export const CHUNK_LDV1_ID = 0x3156444C;
export class LDV1Chunk extends M2Chunk {
    /** uint16 */
    unk0: number;
    /** uint16 */
    lodCount: number;
    /** float */
    unk2: number;
    /** uint8_t */
    particleBoneLOD: [number, number, number, number];
    /** DWORD?? Uint32? */
    unk4: number;

    constructor() {
        super(CHUNK_LDV1_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new LDV1Chunk();
        result.unk0 = buffer.readUInt16LE();
        result.lodCount = buffer.readUInt16LE();
        result.unk2 = buffer.readFloatLE();
        result.particleBoneLOD = [buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8()]
        result.unk4 = buffer.readUInt32LE();
        return result;
    }
}

export const CHUNK_RPID_ID = 0x44495052;
export class RPIDChunk extends M2Chunk {
    /** uint32_t */
    fileDataIDs: number[];

    constructor() {
        super(CHUNK_RPID_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new RPIDChunk();
        const numEntries = chunkSize / 4;
        result.fileDataIDs = new Array(numEntries);
        for (let i = 0; i < numEntries; i++) {
            result.fileDataIDs[i] = buffer.readUInt32LE();

        }
        return result;
    }
}

export const CHUNK_GPID_ID = 0x44495047;
export class GPIDChunk extends M2Chunk {
    /** uint32_t */
    fileDataIDs: number[];

    constructor() {
        super(CHUNK_GPID_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new GPIDChunk();
        const numEntries = chunkSize / 4;
        result.fileDataIDs = new Array(numEntries);
        for (let i = 0; i < numEntries; i++) {
            result.fileDataIDs[i] = buffer.readUInt32LE();

        }
        return result;
    }
}

export const CHUNK_WFV1_ID = 0x31564657;
/** Structure unknown */
export class WFV1Chunk extends M2Chunk {

    constructor() {
        super(CHUNK_WFV1_ID);
    }
}

export const CHUNK_WFV2_ID = 0x32564657;
/** Structure unknown */
export class WFV2Chunk extends M2Chunk {

    constructor() {
        super(CHUNK_WFV2_ID);
    }
}

export interface PGD1Entry {
    /** uint16_t */
    geoset: number;
}

export const CHUNK_PGD1_ID = 0x31444750;
export class PGD1Chunk extends M2Chunk {
    entries: PGD1Entry[];

    constructor() {
        super(CHUNK_PGD1_ID);
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new PGD1Chunk();
        result.entries = M2Types.deserializeM2Array(buffer, buffer.offset, (buff2) => ({ geoset: buff2.readUInt16LE() }));
        return result;
    }
}

export const CHUNK_WFV3_ID = 0x33564657;
export class WFV3Chunk extends M2Chunk {
    /** float */
    bumpScale: number;
    /** float */
    value0_x: number;
    /** float */
    value0_y: number;
    /** float */
    value0_z: number;
    /** float */
    value1_w: number;
    /** float */
    value0_w: number;
    /** float */
    value1_x: number;
    /** float */
    value1_y: number;
    /** float */
    value2_w: number;
    /** float */
    value3_y: number;
    /** float */
    value3_x: number;
    baseColor: CImVector;
    /** uint16_t */
    flags: number;
    /** uint16_t */
    unk0: number;
    /** float */
    value3_w: number;
    /** float */
    value3_z: number;
    /** float */
    value4_y: number;
    /** float */
    unk1: number;
    /** float */
    unk2: number;
    /** float */
    unk3: number;
    /** float */
    unk4: number;

    constructor() {
        super(CHUNK_WFV3_ID);
    }
    static deserialize(buffer: BufferWrapper) {
        const result = new WFV3Chunk();
        result.bumpScale = buffer.readFloatLE();
        result.value0_x = buffer.readFloatLE();
        result.value0_y = buffer.readFloatLE();
        result.value0_z = buffer.readFloatLE();
        result.value1_w = buffer.readFloatLE();
        result.value0_w = buffer.readFloatLE();
        result.value1_x = buffer.readFloatLE();
        result.value1_y = buffer.readFloatLE();
        result.value2_w = buffer.readFloatLE();
        result.value3_y = buffer.readFloatLE();
        result.value3_x = buffer.readFloatLE();
        result.baseColor = CImVector.deserialize(buffer);
        result.flags = buffer.readUInt16LE();
        result.unk0 = buffer.readUInt16LE();
        result.value3_w = buffer.readFloatLE();
        result.value3_z = buffer.readFloatLE();
        result.value4_y = buffer.readFloatLE();
        result.unk1 = buffer.readFloatLE();
        result.unk2 = buffer.readFloatLE();
        result.unk3 = buffer.readFloatLE();
        result.unk4 = buffer.readFloatLE();
        return result;
    }
}

export const CHUNK_PFDC_ID = 0x43444650;
/** Inline physics, let's hope we can ignore this */
export class PFDCChunk extends M2Chunk {

    constructor() {
        super(CHUNK_PFDC_ID);
    }
}

export const CHUNK_EDGF_ID = 0x46474445;
export interface EDGFChunkEntry {
    unk0: [number, number];
    /** float */
    unk1: number;
    /** float ? */
    unk2: number
}
export class EDGFChunk extends M2Chunk {
    entries: EDGFChunkEntry[];

    constructor() {
        super(CHUNK_EDGF_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new EDGFChunk();
        const numEntries = chunkSize / 16;
        result.entries = new Array(numEntries);
        for (let i = 0; i < numEntries; i++) {
            result.entries[i] = {
                unk0: [buffer.readFloatLE(), buffer.readFloatLE()],
                unk1: buffer.readFloatLE(),
                unk2: buffer.readFloatLE(),
            }
        }
        return result;
    }
}

export const CHUNK_NERF_ID = 0x4652454E;
export class NERFChunk extends M2Chunk {
    coefs: C2Vector;

    constructor() {
        super(CHUNK_NERF_ID);
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new NERFChunk();
        result.coefs = C2Vector.deserialize(buffer)
        return result;
    }
}

export const CHUNK_DETL_ID = 0x4C544544;
export interface DETLChunkEntry {
    /** uint16_t */
    flags: number;
    /** uint16_t */
    packedFloat0: number;
    /** uint16_t */
    packedFloat1: number;
    /** uint16_t */
    unk0: number;
    /** uint32_t */
    unk1: number;
}

export class DETLChunk extends M2Chunk {
    entries: DETLChunkEntry[];

    constructor() {
        super(CHUNK_DETL_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new DETLChunk();
        const numEntries = chunkSize / 12;
        result.entries = new Array(numEntries);
        for (let i = 0; i < numEntries; i++) {
            result.entries[i] = {
                flags: buffer.readUInt16LE(),
                packedFloat0: buffer.readUInt16LE(),
                packedFloat1: buffer.readUInt16LE(),
                unk0: buffer.readUInt16LE(),
                unk1: buffer.readUInt32LE(),
            }
        }
        return result;
    }
}

export const CHUNK_DBOC_ID = 0x434F4244;
export class DBOCChunk extends M2Chunk {
    /** float */
    unk1_1: number;
    /** float */
    unk1_2: number;
    /** uint32 */
    unk1_3: number;
    /** uint32 */
    unk1_4: number;
    /** float */
    unk2_1: number;
    /** float */
    unk2_2: number;
    /** uint32 */
    unk2_3: number;
    /** uint32 */
    unk2_4: number;

    constructor() {
        super(CHUNK_DBOC_ID);
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new DBOCChunk();
        result.unk1_1 = buffer.readFloatLE();
        result.unk1_2 = buffer.readFloatLE();
        result.unk1_3 = buffer.readUInt32LE();
        result.unk1_4 = buffer.readUInt32LE();
        result.unk2_1 = buffer.readFloatLE();
        result.unk2_2 = buffer.readFloatLE();
        result.unk2_3 = buffer.readUInt32LE();
        result.unk2_4 = buffer.readUInt32LE();
        return result;
    }
}

export const CHUNK_SKL1_ID = 0x314C4B53;
export class SKL1Chunk extends M2Chunk {
    /** Uint32 */
    flags: number;
    name: string;
    /** Uint8[] */
    unkArray1: [number, number, number, number];

    constructor() {
        super(CHUNK_SKL1_ID);
    }

    static deserialize(buffer: BufferWrapper) {
        const fileOffset = buffer.offset;
        const result = new SKL1Chunk();
        result.flags = buffer.readUInt32LE();
        result.name = M2Types.deserializeM2String(buffer, fileOffset);
        result.unkArray1 = [buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8()]
        return result;
    }
}

export const CHUNK_SKA1_ID = 0x31414B53;
export class SKA1Chunk extends M2Chunk {
    attachments: M2Types.M2Attachment[];
    /** Uint16 */
    attachmentLookupTable: number[];

    constructor() {
        super(CHUNK_SKA1_ID);
    }

    static deserialize(buffer: BufferWrapper, fileOffset: number, sequences: M2Types.M2Sequence[]) {
        const result = new SKA1Chunk();
        result.attachments = M2Types.deserializeM2Array(buffer, fileOffset,
            (buff2, i2) => M2Types.M2Attachment.deserialize(buff2, i2, sequences)
        );
        result.attachmentLookupTable = M2Types.deserializeM2Array(buffer, fileOffset, (buff) => buff.readInt16LE());
        return result;
    }
}

export const CHUNK_SKB1_ID = 0x31424B53;
export class SKB1Chunk extends M2Chunk {
    bones: M2Types.M2CompBone[];
    /** Uint16 */
    keyBoneLookup: number[];

    constructor() {
        super(CHUNK_SKB1_ID);
    }

    static deserialize(buffer: BufferWrapper, fileOffset: number, sequences: M2Types.M2Sequence[]) {
        const result = new SKB1Chunk();
        result.bones = M2Types.deserializeM2Array(buffer, fileOffset, (buff2, offs2) => {
            return M2Types.M2CompBone.deserialize(buff2, offs2, sequences)
        });
        result.keyBoneLookup = M2Types.deserializeM2Array(buffer, fileOffset, (buff) => buff.readInt16LE());
        return result;
    }
}

export const CHUNK_SKS1_ID = 0x31534B53;
export class SKS1Chunk extends M2Chunk {
    globalLoops: M2Types.M2Loop[];
    sequences: M2Types.M2Sequence[];
    /** UInt16 */
    sequenceLookups: number[];
    unkArray2: [number, number, number, number, number, number, number, number];

    constructor() {
        super(CHUNK_SKS1_ID);
    }

    static deserialize(buffer: BufferWrapper, fileOffset: number) {
        const result = new SKS1Chunk();
        result.globalLoops = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Loop.deserialize);
        result.sequences = M2Types.deserializeM2Array(buffer, fileOffset, M2Types.M2Sequence.deserialize);
        result.sequenceLookups = M2Types.deserializeM2Array(buffer, fileOffset, (buff) => buff.readInt16LE());
        result.unkArray2 = [
            buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(),
            buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(),
        ]
        return result;
    }
}


export const CHUNK_SKPD_ID = 0x44504B53;
export class SKPDChunk extends M2Chunk {
    unkArray3: [number, number, number, number, number, number, number, number];
    /** Uint32 */
    parentSkeletonFileId: number;
    unkArray4: [number, number, number, number];

    constructor() {
        super(CHUNK_SKPD_ID);
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new SKPDChunk();
        result.unkArray3 = [
            buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(),
            buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(),
        ]
        result.parentSkeletonFileId = buffer.readUInt32LE();
        result.unkArray4 = [
            buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(),
        ]
        return result;
    }
}

export  const CHUNK_BIDA_ID = 0x41444942;

export class BIDAChunk extends M2Chunk {
    boneIds: number[]

    constructor() {
        super(CHUNK_BIDA_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new BIDAChunk();
        const numEntries = chunkSize / 2;
        result.boneIds = new Array(numEntries);
        for (let i = 0; i < numEntries; i++) {
            result.boneIds[i] = buffer.readUInt16LE();
        }
        return result;
    }

    static isBIDAChunk(chunk: any): chunk is BIDAChunk {
        return chunk && chunk.type && chunk.type === CHUNK_BIDA_ID
    }
}

export const CHUNK_BOMT_ID = 0x544D4F42

export class BOMTChunk extends M2Chunk {
    boneOffsetMatrices: C44Matrix[]

    constructor() {
        super(CHUNK_BOMT_ID);
    }

    static deserialize(buffer: BufferWrapper, chunkSize: number) {
        const result = new BOMTChunk();
        const numEntries = chunkSize / 64;
        result.boneOffsetMatrices = new Array(numEntries);
        for (let i = 0; i < numEntries; i++) {
            result.boneOffsetMatrices[i] = C44Matrix.deserialize(buffer)
        }
        return result;
    }

    static isBOMTChunk(chunk: any): chunk is BOMTChunk {
        return chunk && chunk.type && chunk.type === CHUNK_BOMT_ID
    }
}