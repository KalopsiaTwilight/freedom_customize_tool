import { inflate, deflate } from "pako";

import BufferWrapper from "../../buffer";
import {
    MO3Animation, MO3Bone, MO3Material, MO3ModelAttachment,
    MO3TextureUnit, MO3ParticleEmitter, MO3ExtendedParticle, MO3Texture,
    MO3RibbonEmitter, MO3SubMesh, MO3TextureWeightsContainer,
    MO3TextureTransform, MO3Color, MO3Vertex, getMO3ArraySizeInBytes, getMO3ComplexArraySizeInBytes, serializeMO3Array, arraysEqual
} from "./MO3Types";

export class MO3File {
    version: number;
    m2flags: number;

    vertices: MO3Vertex[];
    /** Uint16[] */
    skinTriangles: number[];
    /** Uint32[] */
    globalLoops: number[];
    animationSequences: MO3Animation[];
    /** https://wowdev.wiki/M2#Animation_Lookup */
    animationSequenceLookupTable: number[];
    bones: MO3Bone[];
    /** Int16 */
    boneCombos: number[];
    /** Int16
     * Used to lookup bones with set arrays [13, 14, 15, 16, 17, 88, 89] and [8, 9, 10, 11, 12, 86, 87] 
     * Possibly related to parent bones */
    keyBoneLookup: number[];
    submeshes: MO3SubMesh[];
    textureUnits: MO3TextureUnit[];
    /** Int16 */
    arg11: number[];
    materials: MO3Material[];
    textures: MO3Texture[];
    /** Int16 */
    textureCombos: number[];
    textureTransforms: MO3TextureTransform[];
    /** Int16 */
    textureTransformCombos: number[];
    /** Int16 */
    textureIndicesById: number[];
    modelAttachments: MO3ModelAttachment[];
    /** Int16 */
    attachmentIndicesById: number[];
    colors: MO3Color[];
    textureWeights: MO3TextureWeightsContainer[];
    /** Int16 */
    textureWeightComboIndex: number[];
    particleEmitters: MO3ParticleEmitter[];
    ribbonEmitters: MO3RibbonEmitter[];
    particles: MO3ExtendedParticle[];
    /** Int16 */
    particleEmitterGeosets: number[];

    /**
   * Construct a new MO3File instance.
   * @param {BufferWrapper} data 
   */
    constructor() {
    }

    static deserialize(data: BufferWrapper) {
        const result = new MO3File();

        const magic = data.readUInt32LE();
        if (magic !== 604210112) {
            throw new Error("Invalid magic number for MO3: " + magic);
        }
        result.version = data.readUInt32LE();
        result.m2flags = data.readUInt32LE();

        const pos1 = data.readUInt32LE();
        const pos2 = data.readUInt32LE();
        const pos3 = data.readUInt32LE();
        const pos4 = data.readUInt32LE();
        const pos5 = data.readUInt32LE();
        const pos6 = data.readUInt32LE();
        const pos7 = data.readUInt32LE();
        const pos8 = data.readUInt32LE();
        const pos9 = data.readUInt32LE();
        const pos10 = data.readUInt32LE();
        const pos11 = data.readUInt32LE();
        const pos12 = data.readUInt32LE();
        const pos13 = data.readUInt32LE();
        const pos14 = data.readUInt32LE();
        const pos15 = data.readUInt32LE();
        const pos16 = data.readUInt32LE();
        const pos17 = data.readUInt32LE();
        const pos18 = data.readUInt32LE();
        const pos19 = data.readUInt32LE();
        const pos20 = data.readUInt32LE();
        const pos21 = data.readUInt32LE();
        const pos22 = data.readUInt32LE();
        const pos23 = data.readUInt32LE();
        const pos24 = data.readUInt32LE();
        const pos25 = data.readUInt32LE();
        const pos26 = data.readUInt32LE();
        const compressedLength = data.readUInt32LE();

        let compressedBytes = new Uint8Array(data.readUInt8(data.remainingBytes));
        let inflatedData: Uint8Array;
        try {
            inflatedData = inflate(compressedBytes)
        } catch {
            throw new Error("Decompression error.");
        }
        if (inflatedData.length < compressedLength) {
            throw new Error("Unexpected data size: " + inflatedData.length + " VS " + compressedLength);
        }
        const reader = new BufferWrapper(Buffer.from(inflatedData));
        reader.seek(pos1);
        result.vertices = this.deserializeArray(reader, MO3Vertex.deserialize)
        reader.seek(pos2);
        result.skinTriangles = this.deserializeArray(reader, (buff) => buff.readUInt16LE());
        reader.seek(pos3)
        result.globalLoops = this.deserializeArray(reader, (buff) => buff.readUInt32LE());
        reader.seek(pos4);
        result.animationSequences = this.deserializeArray(reader, MO3Animation.deserialize);
        reader.seek(pos5);
        result.animationSequenceLookupTable = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos6);
        result.bones = this.deserializeArray(reader, MO3Bone.deserialize)
        reader.seek(pos7);
        result.boneCombos = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos8);
        result.keyBoneLookup = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos9);
        result.submeshes = this.deserializeArray(reader, MO3SubMesh.deserialize);
        reader.seek(pos10);
        result.textureUnits = this.deserializeArray(reader, MO3TextureUnit.deserialize);
        reader.seek(pos11);
        result.arg11 = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos12);
        result.materials = this.deserializeArray(reader, MO3Material.deserialize);
        reader.seek(pos13);
        result.textures = this.deserializeArray(reader, MO3Texture.deserialize);
        reader.seek(pos14);
        result.textureCombos = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos15);
        result.textureTransforms = this.deserializeArray(reader, MO3TextureTransform.deserialize);
        reader.seek(pos16);
        result.textureTransformCombos = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos17);
        result.textureIndicesById = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos18);
        result.modelAttachments = this.deserializeArray(reader, MO3ModelAttachment.deserialize);
        reader.seek(pos19);
        result.attachmentIndicesById = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos20);
        result.colors = this.deserializeArray(reader, MO3Color.deserialize);
        reader.seek(pos21);
        result.textureWeights = this.deserializeArray(reader, MO3TextureWeightsContainer.deserialize);
        reader.seek(pos22);
        result.textureWeightComboIndex = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos23);
        result.particleEmitters = this.deserializeArray(reader, MO3ParticleEmitter.deserialize);
        reader.seek(pos25);
        result.particles = this.deserializeArray(reader, MO3ExtendedParticle.deserialize);
        reader.seek(pos26);
        result.particleEmitterGeosets = this.deserializeArray(reader, (buff) => buff.readInt16LE());
        reader.seek(pos24);
        result.ribbonEmitters = this.deserializeArray(reader, MO3RibbonEmitter.deserialize);

        return result;
    }

    serializeToBuffer() {
        var buffer = BufferWrapper.alloc(this.uncompressedSizeInBytes(), true);
        const verticesPos = 0;
        buffer.seek(0);
        serializeMO3Array(buffer, this.vertices, (buff, x) => x.serialize(buff));
        const skinTrianglesPos = buffer.offset;
        serializeMO3Array(buffer, this.skinTriangles, (buff, x) => buff.writeUInt16LE(x));
        const globalLoopsPos = buffer.offset;
        serializeMO3Array(buffer, this.globalLoops, (buff, x) => buff.writeUInt32LE(x));
        const animationSequencesPos = buffer.offset;
        serializeMO3Array(buffer, this.animationSequences, (buff, x) => x.serialize(buff));
        const animationSequenceLookupPos = buffer.offset;
        serializeMO3Array(buffer, this.animationSequenceLookupTable, (buff, x) => buff.writeInt16LE(x));
        const bonesPos = buffer.offset;
        serializeMO3Array(buffer, this.bones, (buff, x) => x.serialize(buff));
        const boneCombosPos = buffer.offset;
        serializeMO3Array(buffer, this.boneCombos, (buff, x) => buff.writeInt16LE(x));
        const keyBoneLookupPos = buffer.offset;
        serializeMO3Array(buffer, this.keyBoneLookup, (buff, x) => buff.writeInt16LE(x));
        const submeshesPos = buffer.offset;
        serializeMO3Array(buffer, this.submeshes, (buff, x) => x.serialize(buff));
        const textureUnitsPos = buffer.offset;
        serializeMO3Array(buffer, this.textureUnits, (buff, x) => x.serialize(buff));
        const arg11Pos = buffer.offset;
        serializeMO3Array(buffer, this.arg11, (buff, x) => buff.writeInt16LE(x));
        const materialsPos = buffer.offset;
        serializeMO3Array(buffer, this.materials, (buff, x) => x.serialize(buff));
        const texturesPos = buffer.offset;
        serializeMO3Array(buffer, this.textures, (buff, x) => x.serialize(buff));
        const textureCombosPos = buffer.offset;
        serializeMO3Array(buffer, this.textureCombos, (buff, x) => buff.writeInt16LE(x));
        const textureTransformsPos = buffer.offset;
        serializeMO3Array(buffer, this.textureTransforms, (buff, x) => x.serialize(buff));
        const textureTransformCombosPos = buffer.offset;
        serializeMO3Array(buffer, this.textureTransformCombos, (buff, x) => buff.writeInt16LE(x));
        const textureIndicesByIdPos = buffer.offset;
        serializeMO3Array(buffer, this.textureIndicesById, (buff, x) => buff.writeInt16LE(x));
        const modelAttachmentsPos = buffer.offset;
        serializeMO3Array(buffer, this.modelAttachments, (buff, x) => x.serialize(buff));
        const attachmentIndicesByIdPos = buffer.offset;
        serializeMO3Array(buffer, this.attachmentIndicesById, (buff, x) => buff.writeInt16LE(x));
        const arg20Pos = buffer.offset;
        serializeMO3Array(buffer, this.colors, (buff, x) => x.serialize(buff));
        const textureWeightsPos = buffer.offset;
        serializeMO3Array(buffer, this.textureWeights, (buff, x) => x.serialize(buff));
        const textureWeightComboIndexPos = buffer.offset;
        serializeMO3Array(buffer, this.textureWeightComboIndex, (buff, x) => buff.writeInt16LE(x));
        const particleEmittersPos = buffer.offset;
        serializeMO3Array(buffer, this.particleEmitters, (buff, x) => x.serialize(buff));
        const arg24Pos = buffer.offset;
        serializeMO3Array(buffer, this.ribbonEmitters, (buff, x) => x.serialize(buff));
        const arg25Pos = buffer.offset;
        serializeMO3Array(buffer, this.particles, (buff, x) => x.serialize(buff));
        const arg26Pos = buffer.offset;
        serializeMO3Array(buffer, this.particleEmitterGeosets, (buff, x) => buff.writeInt16LE(x));

        const compressedBytes = deflate(buffer._buf)

        const headerBuffer = BufferWrapper.alloc(120);
        headerBuffer.writeUInt32LE(604210112);
        headerBuffer.writeUInt32LE(this.version);
        headerBuffer.writeUInt32LE(this.m2flags);
        headerBuffer.writeUInt32LE(verticesPos);
        headerBuffer.writeUInt32LE(skinTrianglesPos);
        headerBuffer.writeUInt32LE(globalLoopsPos);
        headerBuffer.writeUInt32LE(animationSequencesPos);
        headerBuffer.writeUInt32LE(animationSequenceLookupPos);
        headerBuffer.writeUInt32LE(bonesPos);
        headerBuffer.writeUInt32LE(boneCombosPos);
        headerBuffer.writeUInt32LE(keyBoneLookupPos);
        headerBuffer.writeUInt32LE(submeshesPos);
        headerBuffer.writeUInt32LE(textureUnitsPos);
        headerBuffer.writeUInt32LE(arg11Pos);
        headerBuffer.writeUInt32LE(materialsPos);
        headerBuffer.writeUInt32LE(texturesPos);
        headerBuffer.writeUInt32LE(textureCombosPos);
        headerBuffer.writeUInt32LE(textureTransformsPos);
        headerBuffer.writeUInt32LE(textureTransformCombosPos);
        headerBuffer.writeUInt32LE(textureIndicesByIdPos);
        headerBuffer.writeUInt32LE(modelAttachmentsPos);
        headerBuffer.writeUInt32LE(attachmentIndicesByIdPos);
        headerBuffer.writeUInt32LE(arg20Pos);
        headerBuffer.writeUInt32LE(textureWeightsPos);
        headerBuffer.writeUInt32LE(textureWeightComboIndexPos);
        headerBuffer.writeUInt32LE(particleEmittersPos);
        headerBuffer.writeUInt32LE(arg24Pos);
        headerBuffer.writeUInt32LE(arg25Pos);
        headerBuffer.writeUInt32LE(arg26Pos);
        headerBuffer.writeUInt32LE(compressedBytes.length);

        return BufferWrapper.concat([headerBuffer, BufferWrapper.from(compressedBytes)]);
    }

    equals(other: MO3File) {
        return this.version === other.version && this.m2flags === other.m2flags
            && arraysEqual(this.vertices, other.vertices, (a, b) => a.equals(b))
            && arraysEqual(this.skinTriangles, other.skinTriangles)
            && arraysEqual(this.globalLoops, other.globalLoops)
            && arraysEqual(this.animationSequences, other.animationSequences, (a, b) => a.equals(b))
            && arraysEqual(this.animationSequenceLookupTable, other.animationSequenceLookupTable)
            && arraysEqual(this.bones, other.bones, (a, b) => a.equals(b))
            && arraysEqual(this.boneCombos, other.boneCombos)
            && arraysEqual(this.keyBoneLookup, other.keyBoneLookup)
            && arraysEqual(this.submeshes, other.submeshes, (a, b) => a.equals(b))
            && arraysEqual(this.textureUnits, other.textureUnits, (a, b) => a.equals(b))
            && arraysEqual(this.arg11, other.arg11)
            && arraysEqual(this.materials, other.materials, (a, b) => a.equals(b))
            && arraysEqual(this.textures, other.textures, (a, b) => a.equals(b))
            && arraysEqual(this.textureCombos, other.textureCombos)
            && arraysEqual(this.textureTransforms, other.textureTransforms, (a, b) => a.equals(b))
            && arraysEqual(this.textureTransformCombos, other.textureTransformCombos)
            && arraysEqual(this.textureIndicesById, other.textureIndicesById)
            && arraysEqual(this.modelAttachments, other.modelAttachments, (a, b) => a.equals(b))
            && arraysEqual(this.attachmentIndicesById, other.attachmentIndicesById)
            && arraysEqual(this.colors, other.colors, (a, b) => a.equals(b))
            && arraysEqual(this.textureWeights, other.textureWeights, (a, b) => a.equals(b))
            && arraysEqual(this.textureWeightComboIndex, other.textureWeightComboIndex)
            && arraysEqual(this.particleEmitters, other.particleEmitters, (a, b) => a.equals(b))
            && arraysEqual(this.ribbonEmitters, other.ribbonEmitters, (a, b) => a.equals(b))
            && arraysEqual(this.particles, other.particles, (a, b) => a.equals(b))
            && arraysEqual(this.particleEmitterGeosets, other.particleEmitterGeosets);
    }

    verticesEqual(other: MO3File) {
        return arraysEqual(this.vertices, other.vertices, (a, b) => a.equals(b))
    }

    uncompressedSizeInBytes() {
        return getMO3ArraySizeInBytes(this.vertices, MO3Vertex.sizeOf()) +
            getMO3ArraySizeInBytes(this.skinTriangles, 2) +
            getMO3ArraySizeInBytes(this.globalLoops, 4) +
            getMO3ComplexArraySizeInBytes(this.animationSequences) +
            getMO3ArraySizeInBytes(this.animationSequenceLookupTable, 2) +
            getMO3ComplexArraySizeInBytes(this.bones) +
            getMO3ArraySizeInBytes(this.boneCombos, 2) +
            getMO3ArraySizeInBytes(this.keyBoneLookup, 2) +
            getMO3ArraySizeInBytes(this.submeshes, MO3SubMesh.sizeOf()) +
            getMO3ArraySizeInBytes(this.textureUnits, MO3TextureUnit.sizeOf()) +
            getMO3ArraySizeInBytes(this.arg11, 2) +
            getMO3ArraySizeInBytes(this.materials, MO3Material.sizeOf()) +
            getMO3ArraySizeInBytes(this.textures, MO3Texture.sizeOf()) +
            getMO3ArraySizeInBytes(this.textureCombos, 2) +
            getMO3ComplexArraySizeInBytes(this.textureTransforms) +
            getMO3ArraySizeInBytes(this.textureTransformCombos, 2) +
            getMO3ArraySizeInBytes(this.textureIndicesById, 2) +
            getMO3ArraySizeInBytes(this.modelAttachments, MO3ModelAttachment.sizeOf()) +
            getMO3ArraySizeInBytes(this.attachmentIndicesById, 2) +
            getMO3ComplexArraySizeInBytes(this.colors) +
            getMO3ComplexArraySizeInBytes(this.textureWeights) +
            getMO3ArraySizeInBytes(this.textureWeightComboIndex, 2) +
            getMO3ComplexArraySizeInBytes(this.particleEmitters) +
            getMO3ComplexArraySizeInBytes(this.ribbonEmitters) +
            getMO3ComplexArraySizeInBytes(this.particles) +
            getMO3ArraySizeInBytes(this.particleEmitterGeosets, 2)
    }

    private static deserializeArray<T>(data: BufferWrapper, deserializeFn: (data: BufferWrapper, i: number) => T): T[] {
        const elems = data.readInt32LE();
        if (elems > 0) {
            const result = new Array(elems);
            for (let i = 0; i < elems; i++) {
                result[i] = deserializeFn(data, i);
            }
            return result;
        }
        return [];
    }
}