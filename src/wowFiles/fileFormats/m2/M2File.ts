import log from "electron-log"

import { CASC } from "../../casc";
import BufferWrapper from "../../buffer";

import * as M2Chunks from "./M2Chunks";
import * as M2Types from "./M2Types";
import { C2Vector, C3Vector, CAxisAlignedBox, Fixed_Point, deserializeFixed16 } from "../commonTypes";
import M2Skin from "./Skin";
import { SKELFile } from "./SKELFile";
import { ANIMFile } from "./ANIMFile";

export class M2File {
    /* MD21 Data */
    version: number;
    name: string;
    flags: M2Chunks.MD21ChunkFlags;
    globalLoops: M2Types.M2Loop[];
    sequences: M2Types.M2Sequence[];
    sequenceLookupTable: number[];
    bones: M2Types.M2CompBone[];
    vertices: M2Types.M2Vertex[];
    numSkinProfiles: number;
    colors: M2Types.M2Color[];
    textures: M2Types.M2Texture[];
    textureWeights: M2Types.M2TextureWeight[];
    textureTransforms: M2Types.M2TextureTransform[];
    textureIndicesById: number[];
    materials: M2Types.M2Material[];
    boneCombos: number[];
    textureCombos: number[];
    textureCoordCombos: number[];
    textureWeightCombos: number[];
    textureTransformCombos: number[];
    boundingBox: CAxisAlignedBox;
    boundingSphereRadius: number;
    collisionBox: CAxisAlignedBox;
    collisionSphereRadius: number;
    collisionIndices: number[];
    collisionPosition: C3Vector[];
    collisionFaceNormals: C3Vector[];
    attachments: M2Types.M2Attachment[];
    attachmentLookupTable: number[];
    events: M2Types.M2Event[];
    lights: M2Types.M2Light[];
    cameras: M2Types.M2Camera[];
    cameraIndicesById: number[];
    ribbonEmitters: M2Types.M2Ribbon[];
    particleEmitters: M2Types.M2ParticleEmitter[];
    textureCombinerCombos: number[];
    /* SFID */
    skinFileDataIDs: number[];
    lodSkinFileDataIDs: number[];
    /* PFID */
    physicsFileId: number;
    /* AFID */
    animFileIds: M2Chunks.AnimationFileEntry[];
    /* BFID */
    boneFileDataIds: number[];
    /* TXAC */
    textureAcData: [number, number][]
    /* EXPT/EXP2 */
    particlesExtended: M2Types.M2ExtendedParticle[];
    /* PABC */
    replacementParentSequenceLookups: number[];
    /* PSBC */
    parentSequenceBounds: M2Types.M2Bounds[];
    /* PEDC */
    parentEventData: M2Types.M2TrackBase[];
    /* SKID */
    skeletonFileId: number;
    /* LDV1 */
    ldv1Data: M2Chunks.LDV1Chunk;
    /* RPID */
    recursiveParticleModelFileIds: number[];
    /* GPID */
    geometryParticleModelFileIds: number[];
    /* PGD1 */
    particleEmitterGeosets: M2Chunks.PGD1Entry[];
    /* WFV3 */
    wfv3data: M2Chunks.WFV3Chunk;
    /* EDGF */
    edgeFadeData: M2Chunks.EDGFChunkEntry[];
    /* NERF */
    alphaCoEfficient: C2Vector;
    /* DETL */
    lightsData: M2Chunks.DETLChunkEntry[];
    /* DBOC */
    DBOCData: M2Chunks.DBOCChunk;

    skins: M2Skin[];
    lodSkins: M2Skin[];
    keyBoneLookup: number[];
    
    constructor() {
        this.version = 0;
        this.name = "";
        this.flags = 0;
        this.globalLoops = [];
        this.sequences = [];
        this.sequenceLookupTable = [];
        this.bones = [];
        this.vertices = [];
        this.numSkinProfiles = 0;
        this.colors = [];
        this.textures = [];
        this.textureWeights = [];
        this.textureTransforms = [];
        this.textureIndicesById = [];
        this.materials = [];
        this.boneCombos = [];
        this.textureCombos = [];
        this.textureCoordCombos = [];
        this.textureWeightCombos = [];
        this.textureTransformCombos = [];
        this.boundingBox = new CAxisAlignedBox();
        this.boundingSphereRadius = 0;
        this.collisionBox = new CAxisAlignedBox();
        this.collisionSphereRadius = 0;
        this.collisionIndices = [];
        this.collisionPosition = [];
        this.collisionFaceNormals = [];
        this.attachments = [];
        this.attachmentLookupTable = [];
        this.events = [];
        this.lights = [];
        this.cameras = [];
        this.cameraIndicesById = [];
        this.ribbonEmitters = [];
        this.particleEmitters = [];
        this.textureCombinerCombos = [];
        this.skinFileDataIDs = [];
        this.lodSkinFileDataIDs = [];
        this.physicsFileId = 0;
        this.animFileIds = [];
        this.boneFileDataIds = [];
        this.textureAcData = [];
        this.particlesExtended = [];
        this.replacementParentSequenceLookups = [];
        this.parentSequenceBounds = [];
        this.parentEventData = [];
        this.skeletonFileId = 0;
        this.ldv1Data = new M2Chunks.LDV1Chunk();
        this.recursiveParticleModelFileIds = [];
        this.geometryParticleModelFileIds = [];
        this.particleEmitterGeosets = [];
        this.wfv3data = new M2Chunks.WFV3Chunk();
        this.edgeFadeData = [];
        this.alphaCoEfficient = new  C2Vector();
        this.lightsData = [];
        this.DBOCData = new M2Chunks.DBOCChunk();
        this.skins = [];
        this.lodSkins = [];
        this.keyBoneLookup = [];
    }

    deserialize(buffer: BufferWrapper) {
        let fileOffset = 0;

        const chunks = [];

        while (buffer.remainingBytes > 0) {
            const chunkID = buffer.readUInt32LE();
            const chunkSize = buffer.readUInt32LE();
            const nextChunkPos = buffer.offset + chunkSize;

            switch (chunkID) {
                case M2Chunks.CHUNK_MD21_ID: {
                    fileOffset = buffer.offset;
                    this.deserializeChunk_MD21(buffer); break;
                }
                case M2Chunks.CHUNK_PFID_ID: this.deserializeChunk_PFID(buffer); break;
                case M2Chunks.CHUNK_SFID_ID: this.deserializeChunk_SFID(buffer, chunkSize); break;
                case M2Chunks.CHUNK_AFID_ID: this.deserializeChunk_AFID(buffer, chunkSize); break;
                case M2Chunks.CHUNK_BFID_ID: this.deserializeChunk_BFID(buffer, chunkSize); break;
                case M2Chunks.CHUNK_TXAC_ID: this.deserializeChunk_TXAC(buffer, chunkSize); break;
                case M2Chunks.CHUNK_EXPT_ID: this.deserializeChunk_EXPT(buffer, chunkSize); break;
                case M2Chunks.CHUNK_EXP2_ID: this.deserializeChunk_EXP2(buffer); break;
                case M2Chunks.CHUNK_PABC_ID: this.deserializeChunk_PABC(buffer, chunkSize); break;
                case M2Chunks.CHUNK_PADC_ID: this.deserializeChunk_PADC(buffer, chunkSize); break;
                case M2Chunks.CHUNK_PSBC_ID: this.deserializeChunk_PSBC(buffer, chunkSize); break;
                case M2Chunks.CHUNK_PEDC_ID: {
                    log.info("[M2File] Received PEDC block, unknown how to deserialize.");
                    break;
                }
                case M2Chunks.CHUNK_SKID_ID: this.deserializeChunk_SKID(buffer); break;
                case M2Chunks.CHUNK_TXID_ID: this.deserializeChunk_TXID(buffer, chunkSize); break;
                case M2Chunks.CHUNK_LDV1_ID: this.deserializeChunk_LDV1(buffer, chunkSize); break;
                case M2Chunks.CHUNK_RPID_ID: this.deserializeChunk_RPID(buffer, chunkSize); break;
                case M2Chunks.CHUNK_GPID_ID: this.deserializeChunk_GPID(buffer, chunkSize); break;
                case M2Chunks.CHUNK_WFV1_ID: {
                    log.info("[M2File] Received WFV1 block, unknown how to deserialize.");
                    break;
                }
                case M2Chunks.CHUNK_WFV2_ID: {
                    log.info("[M2File] Received WFV2 block, unknown how to deserialize.");
                    break;
                }
                case M2Chunks.CHUNK_PGD1_ID: this.deserializeChunk_PGD1(buffer); break;
                case M2Chunks.CHUNK_WFV3_ID: this.deserializeChunk_WFV3(buffer); break;
                case M2Chunks.CHUNK_PFDC_ID: {
                    log.info("[M2File] Received PFDC block, unknown how to deserialize.");
                    break;
                }
                case M2Chunks.CHUNK_EDGF_ID: this.deserializeChunk_EDGF(buffer, chunkSize); break;
                case M2Chunks.CHUNK_NERF_ID: this.deserializeChunk_NERF(buffer); break;
                case M2Chunks.CHUNK_DETL_ID: this.deserializeChunk_DETL(buffer, chunkSize); break;
                case M2Chunks.CHUNK_DBOC_ID: this.deserializeChunk_DBOC(buffer); break;
                default: {
                    log.debug("[M2File] skipped chunk: ", chunkID)
                }
            }

            // Ensure that we start at the next chunk exactly.
            buffer.seek(nextChunkPos);
        }
    }

    async loadSkins(cascSource: CASC) {
        this.skins = [];
        this.lodSkins = [];

        for(const skinId of this.skinFileDataIDs) {
            const skin = new M2Skin(skinId);
            skin.deserialize(await cascSource.getFile(skinId));
            this.skins.push(skin);
        }
        for(const skinId of this.lodSkinFileDataIDs) {
            const skin = new M2Skin(skinId);
            skin.deserialize(await cascSource.getFile(skinId));
            this.lodSkins.push(skin);
        }
    }

    async loadSkeleton(cascSource: CASC) {
        if (this.skeletonFileId) {
            const skelFile = new SKELFile();
            skelFile.deserialize(await cascSource.getFile(this.skeletonFileId));
            
            this.keyBoneLookup = skelFile.keyBoneLookup;
            this.bones = skelFile.bones ? skelFile.bones : this.bones;
            this.sequences = skelFile.sequences ? skelFile.sequences : this.sequences;
            this.sequenceLookupTable = skelFile.sequenceLookups ? skelFile.sequenceLookups : this.sequenceLookupTable;
            this.attachments = skelFile.attachments ? skelFile.attachments : this.attachments;
            this.attachmentLookupTable = skelFile.attachmentLookupTable ? skelFile.attachmentLookupTable : this.attachmentLookupTable;
            this.boneFileDataIds = skelFile.boneFileDataIds ? skelFile.boneFileDataIds : this.boneFileDataIds;
            this.animFileIds = skelFile.animFileIds ? skelFile.animFileIds : this.animFileIds;
            this.globalLoops = skelFile.globalLoops ? skelFile.globalLoops : this.globalLoops;
        }
    }

    async loadAnims(cascSource: CASC) {
        const animDataMap = new Map<number, BufferWrapper>();

        for(let i = 0; i < this.sequences.length; i++) {
            let anim = this.sequences[i];
            while (anim.flags & 0x40) {
                anim = this.sequences[anim.aliasNext];
            }

            if (anim.flags & 0x20) {
                // Animation is stored in sequence
                continue;
            }

            const fileEntry = this.animFileIds.find(x => x.animId === anim.id && x.subAnimId === anim.variationIndex);
            if (!fileEntry || fileEntry.fileId === 0) {
                continue;
            }
            const chunked = (this.flags & 0x200000) > 0 || this.skeletonFileId > 0;

            const animFile = ANIMFile.deserialize(await cascSource.getFile(fileEntry.fileId), chunked);
            if (animFile.boneData) {
                animDataMap.set(i, BufferWrapper.from(animFile.boneData));
            } else {
                animDataMap.set(i, BufferWrapper.from(animFile.animData))
            }
        }

        for(const bone of this.bones) {
            this.readOutOfSequenceTrack(bone.translation, animDataMap, C3Vector.deserialize);
            this.readOutOfSequenceTrack(bone.rotation, animDataMap, M2Types.M2CompQuat.deserialize);
            this.readOutOfSequenceTrack(bone.scale, animDataMap, C3Vector.deserialize);
        }
        for(const color of this.colors) {
            this.readOutOfSequenceTrack(color.alpha, animDataMap, deserializeFixed16);
            this.readOutOfSequenceTrack(color.color, animDataMap, C3Vector.deserialize);
        }
        for (const weight of this.textureWeights) {
            this.readOutOfSequenceTrack(weight.weight, animDataMap, deserializeFixed16);
        }
        for (const transform of this.textureTransforms) {
            this.readOutOfSequenceTrack(transform.translation, animDataMap, C3Vector.deserialize);
            this.readOutOfSequenceTrack(transform.rotation, animDataMap, M2Types.M2CompQuat.deserialize);
            this.readOutOfSequenceTrack(transform.scaling, animDataMap, C3Vector.deserialize);
        }
        for (const attachment of this.attachments) {
            this.readOutOfSequenceTrack(attachment.animateAttached, animDataMap, (buff2) => buff2.readUInt8());
        }
        for (const light of this.lights) {
            this.readOutOfSequenceTrack(light.ambientColor, animDataMap, C3Vector.deserialize);
            this.readOutOfSequenceTrack(light.ambientIntensity, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(light.diffuseColor, animDataMap, C3Vector.deserialize);
            this.readOutOfSequenceTrack(light.diffuseIntensity, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(light.attenuationStart, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(light.attenuationEnd, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(light.visibility, animDataMap, (buff2) => buff2.readUInt8());
        }
        for (const camera of this.cameras) {
            this.readOutOfSequenceTrack(camera.positions, animDataMap, 
                (buff2, i) => M2Types.M2SplineKey.deserialize(buff2, i, C3Vector.deserialize)
            )
            this.readOutOfSequenceTrack(camera.targetPosition, animDataMap, 
                (buff2, i) => M2Types.M2SplineKey.deserialize(buff2, i, C3Vector.deserialize)
            )
            this.readOutOfSequenceTrack(camera.roll, animDataMap, 
                (buff2, i) => M2Types.M2SplineKey.deserialize(buff2, i, (buff3) => buff3.readFloatLE())
            )
            this.readOutOfSequenceTrack(camera.fov, animDataMap, 
                (buff2, i) => M2Types.M2SplineKey.deserialize(buff2, i, (buff3) => buff3.readFloatLE())
            )
        }
        for (const ribbonEmitter of this.ribbonEmitters) {
            this.readOutOfSequenceTrack(ribbonEmitter.colorTrack, animDataMap, C3Vector.deserialize);
            this.readOutOfSequenceTrack(ribbonEmitter.alphaTrack, animDataMap, deserializeFixed16);
            this.readOutOfSequenceTrack(ribbonEmitter.heightAboveTrack, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(ribbonEmitter.heightBelowTrack, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(ribbonEmitter.texSlotTrack, animDataMap, (buff2) => buff2.readUInt16LE());
            this.readOutOfSequenceTrack(ribbonEmitter.visibilityTrack, animDataMap, (buff2) => buff2.readUInt8());
        }
        for (const particleEmitter of this.particleEmitters) {
            this.readOutOfSequenceTrack(particleEmitter.emissionSpeed, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.speedVariation, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.verticalRange, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.horizontalRange, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.gravity, animDataMap, (buff2) => 
                M2Types.M2ParticleEmitter.deserializeGravity(particleEmitter.flags, buff2)
            );
            this.readOutOfSequenceTrack(particleEmitter.lifespan, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.emissionRate, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.emissionAreaLength, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.emissionAreaWidth, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.zSource, animDataMap, (buff2) => buff2.readFloatLE());
            this.readOutOfSequenceTrack(particleEmitter.enabledIn, animDataMap, (buff2) => buff2.readUInt8());
        }
    }

    readOutOfSequenceTrack<T>(
        track: M2Types.M2Track<T>, animDataMap: Map<number, BufferWrapper>, 
        deserializeTFn: ((buffer: BufferWrapper, index: number) => T)
    ) {
        for(const i of animDataMap.keys()) {
            const buffer = animDataMap.get(i);
            if (track.timestamps.length > 0 && track.timeStampsOutOfSequence[i]) {
                const [timeStampCount, timeStampOffset] = track.timeStampsOutOfSequence[i];
                const [valueCount, valueOffset] = track.valuesOutOfSequence[i];

                buffer.seek(timeStampOffset);
                track.timestamps[i] = buffer.readUInt32LE(timeStampCount);

                buffer.seek(valueOffset);
                track.values[i] = [];
                for(let j = 0; j < valueCount; j++) {
                    track.values[i].push(deserializeTFn(buffer, j));
                }
            }
        }
    }

    deserializeChunk_MD21(buffer: BufferWrapper) {
        const md21chunk = M2Chunks.MD21Chunk.deserialize(buffer);
        this.version = md21chunk.version;
        this.name = md21chunk.name;
        this.flags = md21chunk.flags;
        this.globalLoops = md21chunk.globalLoops;
        this.sequences = md21chunk.sequences;
        this.sequenceLookupTable = md21chunk.sequenceIdxHashById;
        this.bones = md21chunk.bones;
        this.keyBoneLookup = md21chunk.boneIndicesById;
        this.vertices = md21chunk.vertices;
        this.colors = md21chunk.colors;
        this.textures = md21chunk.textures;
        this.textureWeights = md21chunk.textureWeights;
        this.textureTransforms = md21chunk.textureTransforms;
        this.textureIndicesById = md21chunk.textureIndicesById;
        this.materials = md21chunk.materials;
        this.boneCombos = md21chunk.boneCombos;
        this.textureCombos = md21chunk.textureCombos;
        this.textureCoordCombos = md21chunk.textureCoordCombos;
        this.textureWeightCombos = md21chunk.textureWeightCombos;
        this.textureTransformCombos = md21chunk.textureTransformCombos;
        this.boundingBox = md21chunk.boundingBox;
        this.boundingSphereRadius = md21chunk.boundingSphereRadius;
        this.collisionBox = md21chunk.collisionBox;
        this.collisionSphereRadius = md21chunk.collisionSphereRadius;
        this.collisionIndices = md21chunk.collisionIndices;
        this.collisionPosition = md21chunk.collisionPosition;
        this.collisionFaceNormals = md21chunk.collisionFaceNormals;
        this.attachments = md21chunk.attachments;
        this.attachmentLookupTable = md21chunk.attachmentIndicesById;
        this.events = md21chunk.events;
        this.lights = md21chunk.lights;
        this.cameras = md21chunk.cameras;
        this.cameraIndicesById = md21chunk.cameraIndicesById;
        this.ribbonEmitters = md21chunk.ribbonEmitters;
        this.particleEmitters = md21chunk.particleEmitters;
        this.textureCombinerCombos = md21chunk.textureCombinerCombos;
        this.numSkinProfiles = md21chunk.numSkinProfiles;
    }
    deserializeChunk_PFID(buffer: BufferWrapper) {
        const chunkData = M2Chunks.PFIDChunk.deserialize(buffer);
        this.physicsFileId = chunkData.physFileId;
    }
    deserializeChunk_SFID(buffer: BufferWrapper, chunkSize: number) {
        if (this.numSkinProfiles === undefined)
            throw new Error('Cannot deserialize SFID chunk in M2 before MD21 chunk!');

        const chunkData = M2Chunks.SFIDChunk.deserialize(buffer, chunkSize, this.numSkinProfiles);
        this.skinFileDataIDs = chunkData.skinFileDataIDs;
        this.lodSkinFileDataIDs = chunkData.lodSkinFileDataIDs;
    }
    deserializeChunk_AFID(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.AFIDChunk.deserialize(buffer, chunkSize);
        this.animFileIds = chunkData.entries;
    }
    deserializeChunk_BFID(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.BFIDChunk.deserialize(buffer, chunkSize);
        this.boneFileDataIds = chunkData.boneFileDataIDs;
    }
    deserializeChunk_TXAC(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.TXACChunk.deserialize(buffer, chunkSize);
        this.textureAcData = chunkData.entries;
    }
    deserializeChunk_EXPT(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.EXPTChunk.deserialize(buffer, chunkSize);
        this.particlesExtended = chunkData.entries.map(x => x.toExtendedParticle());
    }
    deserializeChunk_EXP2(buffer: BufferWrapper) {
        const chunkData = M2Chunks.EXP2Chunk.deserialize(buffer);
        this.particlesExtended = chunkData.entries;
    }
    deserializeChunk_PABC(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.PABCChunk.deserialize(buffer, chunkSize);
        this.replacementParentSequenceLookups = chunkData.replacementParentSequenceLookups;
    }
    deserializeChunk_PADC(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.PADCChunk.deserialize(buffer, chunkSize, this.textureWeights.length, this.sequences);
        this.textureWeights = chunkData.entries;
    }
    deserializeChunk_PSBC(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.PSBCChunk.deserialize(buffer, chunkSize);
        this.parentSequenceBounds = chunkData.parentSequenceBounds;
    }
    deserializeChunk_SKID(buffer: BufferWrapper) {
        const chunkData = M2Chunks.SKIDChunk.deserialize(buffer);
        this.skeletonFileId = chunkData.skeletonFileID
    }
    deserializeChunk_TXID(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.TXIDChunk.deserialize(buffer, chunkSize);
        for(let i = 0; i < this.textures.length; i++) {
            this.textures[i].fileId = chunkData.fileDataIDs[i];
        }
    }
    deserializeChunk_LDV1(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.LDV1Chunk.deserialize(buffer, chunkSize);
        this.ldv1Data = chunkData;
    }
    deserializeChunk_RPID(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.RPIDChunk.deserialize(buffer, chunkSize);
        this.recursiveParticleModelFileIds = chunkData.fileDataIDs;
    }
    deserializeChunk_GPID(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.GPIDChunk.deserialize(buffer, chunkSize);
        this.geometryParticleModelFileIds = chunkData.fileDataIDs;
    }
    deserializeChunk_PGD1(buffer: BufferWrapper) {
        const chunkData = M2Chunks.PGD1Chunk.deserialize(buffer);
        this.particleEmitterGeosets = chunkData.entries;
    }
    deserializeChunk_WFV3(buffer: BufferWrapper) {
        const chunkData = M2Chunks.WFV3Chunk.deserialize(buffer);
        this.wfv3data = chunkData;
    }
    deserializeChunk_EDGF(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.EDGFChunk.deserialize(buffer, chunkSize);
        this.edgeFadeData = chunkData.entries;
    }
    deserializeChunk_NERF(buffer: BufferWrapper) {
        const chunkData = M2Chunks.NERFChunk.deserialize(buffer);
        this.alphaCoEfficient = chunkData.coefs;
    }
    deserializeChunk_DETL(buffer: BufferWrapper, chunkSize: number) {
        const chunkData = M2Chunks.DETLChunk.deserialize(buffer, chunkSize);
        this.lightsData = chunkData.entries;
    }
    deserializeChunk_DBOC(buffer: BufferWrapper) {
        const chunkData = M2Chunks.DBOCChunk.deserialize(buffer);
        this.DBOCData = chunkData;
    }
}