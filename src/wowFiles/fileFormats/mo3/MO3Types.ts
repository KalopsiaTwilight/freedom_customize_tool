import BufferWrapper from "../../buffer";

export type Float2 = [number, number];
export type Float3 = [number, number, number]
export type Float4 = [number, number, number, number]

export interface MO3Serializable {
    serialize(buffer: BufferWrapper, serializeElemFn?: (buffer: BufferWrapper, obj: any) => void): void;
    sizeInBytes(elemSize?: number): number;
}

export function arraysEqual<T>(a: T[], b: T[], compFn?: ((a:T, b:T) => boolean)) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (!compFn) {
            if (a[i] !== b[i]) {
                return false;
            }
        } else {
            if(!compFn(a[i], b[i])) {
                return false;
            }
        }
    }
    return true;
}

export function floatEqualish(floatA: number, floatB: number) {
    return floatA === floatB ||  ( floatA > floatB -0.001 && floatA < floatB +0.001)
}

export class MO3Vertex {
    /** Float32 */
    pos: Float3
    /** Float32 */
    normal: Float4
    /** Float32 */
    texCoords1_x: number;
    /** Float32 */
    texCoords1_y: number;
    /** Float32 */
    texCoords2_x: number;
    /** Float32 */
    texCoords2_y: number;
    /** Uint8 */
    boneWeights: [number, number, number, number]
    /** Uint8 */
    boneIndices: [number, number, number, number]

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3Vertex();
        result.pos = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()]
        result.normal = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE(), 0]
        result.texCoords1_x = buffer.readFloatLE();
        result.texCoords1_y = buffer.readFloatLE();
        result.texCoords2_x = buffer.readFloatLE();
        result.texCoords2_y = buffer.readFloatLE();
        result.boneWeights = [buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8()]
        result.boneIndices = [buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8()]
        return result;
    }

    equals(other: MO3Vertex) {
        return arraysEqual(this.pos, other.pos, floatEqualish)
            && arraysEqual(this.normal, other.normal, floatEqualish)
            && floatEqualish(this.texCoords1_x, other.texCoords1_x)
            && floatEqualish(this.texCoords1_y, other.texCoords1_y)
            && floatEqualish(this.texCoords2_x, other.texCoords2_x)
            && floatEqualish(this.texCoords2_y, other.texCoords2_y)
            && arraysEqual(this.boneWeights, other.boneWeights)
            && arraysEqual(this.boneIndices, other.boneIndices)
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeFloatLE(this.pos[0]);
        buffer.writeFloatLE(this.pos[1]);
        buffer.writeFloatLE(this.pos[2]);
        buffer.writeFloatLE(this.normal[0]);
        buffer.writeFloatLE(this.normal[1]);
        buffer.writeFloatLE(this.normal[2]);
        buffer.writeFloatLE(this.texCoords1_x);
        buffer.writeFloatLE(this.texCoords1_y);
        buffer.writeFloatLE(this.texCoords2_x);
        buffer.writeFloatLE(this.texCoords2_y);
        buffer.writeUInt8(this.boneWeights[0]);
        buffer.writeUInt8(this.boneWeights[1]);
        buffer.writeUInt8(this.boneWeights[2]);
        buffer.writeUInt8(this.boneWeights[3]);
        buffer.writeUInt8(this.boneIndices[0]);
        buffer.writeUInt8(this.boneIndices[1]);
        buffer.writeUInt8(this.boneIndices[2]);
        buffer.writeUInt8(this.boneIndices[3]);
    }

    static sizeOf() {
        return 52;
    }

    sizeInBytes() {
        return MO3Vertex.sizeOf();
    }
}

export class MO3Animation {
    /** Uint16 */
    id: number;
    /** Uint16 */
    variationIndex: number;
    /** Uint32 */
    duration: number;
    /** Uint32 */
    flags: number;
    /** Uint16 */
    frequency: number;
    /** Uint16 */
    blendTimeIn: number;
    /** Uint16 */
    blendTimeOut: number;
    /** Float32 */
    extentMin: Float3
    /** Float32 */
    extentMax: Float3
    /** Int16 */
    variationNext: number;
    /** Uint16 */
    aliasNext: number;
    animationName: string;

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3Animation();
        result.id = buffer.readUInt16LE();
        result.variationIndex = buffer.readUInt16LE();
        result.duration = buffer.readUInt32LE();
        result.flags = buffer.readUInt32LE();
        result.frequency = buffer.readUInt16LE();
        result.blendTimeIn = buffer.readUInt16LE();
        result.blendTimeOut = buffer.readUInt16LE();
        result.extentMin = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()]
        result.extentMax = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()]
        result.variationNext = buffer.readInt16LE();
        result.aliasNext = buffer.readUInt16LE();
        const hasString = buffer.readUInt8();
        if (hasString) {
            result.animationName = deserializeMO3string(buffer);
        }
        return result;
    }

    equals(other: MO3Animation) {
        return this.id === other.id
            && this.variationIndex === other.variationIndex
            && this.duration === other.duration
            && this.flags === other.flags
            && this.frequency === other.frequency
            && this.blendTimeIn === other.blendTimeIn
            && this.blendTimeOut === other.blendTimeOut
            && arraysEqual(this.extentMax, other.extentMax, floatEqualish)
            && arraysEqual(this.extentMin, other.extentMin, floatEqualish)
            && this.variationIndex === other.variationIndex
            && this.aliasNext === other.aliasNext
            && this.animationName === other.animationName
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeUInt16LE(this.id);
        buffer.writeUInt16LE(this.variationIndex);
        buffer.writeUInt32LE(this.duration);
        buffer.writeUInt32LE(this.flags);
        buffer.writeUInt16LE(this.frequency);
        buffer.writeUInt16LE(this.blendTimeIn);
        buffer.writeUInt16LE(this.blendTimeOut);
        buffer.writeFloatLE(this.extentMin[0]);
        buffer.writeFloatLE(this.extentMin[1]);
        buffer.writeFloatLE(this.extentMin[2]);
        buffer.writeFloatLE(this.extentMax[0]);
        buffer.writeFloatLE(this.extentMax[1]);
        buffer.writeFloatLE(this.extentMax[2]);
        buffer.writeInt16LE(this.variationNext);
        buffer.writeUInt16LE(this.aliasNext);
        if (this.animationName.length > 0) {
            buffer.writeUInt8(1);
            serializeMO3string(buffer, this.animationName);
        } else {
            buffer.writeUInt8(0);
        }
    }

    sizeInBytes() {
        return 47 + (
            (this.animationName && this.animationName.length > 0) ? getMO3StringLengthInBytes(this.animationName) : 0
        );
    }
}

export class MO3TrackBase<T> {
    /** Int16 */
    interpolationType: number;
    /** Int16 */
    globalSequence: number;
    /** UInt8, is false if timestamps = [] */
    hasTimeStamps: boolean;
    /** Int32[] */
    timestamps: number[];
    /** This gets filled in per extended class */
    values: T[];

    static deserialize<T>(buffer: BufferWrapper, deserializeTFn: (buffer: BufferWrapper) => T) {
        const result = new MO3TrackBase<T>();
        result.interpolationType = buffer.readInt16LE();
        result.globalSequence = buffer.readInt16LE();
        result.hasTimeStamps = buffer.readUInt8() === 1;
        result.timestamps = deserializeMO3Array(buffer, (buff) => buff.readInt32LE());
        result.values = deserializeMO3Array(buffer, deserializeTFn);
        return result;
    }

    equals(other: MO3TrackBase<T>, compFn?: (a: T, b: T) => boolean) {
        return  this.interpolationType === other.interpolationType
        &&      this.globalSequence === other.globalSequence
        &&      this.hasTimeStamps === other.hasTimeStamps
        &&      arraysEqual(this.timestamps, other.timestamps)
        &&      arraysEqual(this.values, other.values, compFn)
    }

    serialize(buffer: BufferWrapper, serializeTFn: (data: BufferWrapper, obj: T) => void) {
        buffer.writeInt16LE(this.interpolationType);
        buffer.writeInt16LE(this.globalSequence);
        buffer.writeUInt8(this.hasTimeStamps ? 1 : 0);
        serializeMO3Array(buffer, this.timestamps, (buffer, x) => buffer.writeInt32LE(x));
        serializeMO3Array(buffer, this.values, serializeTFn);
    }

    sizeInBytes(sizeOfT: number) {
        return 5 + getMO3ArraySizeInBytes(this.timestamps, 4) + getMO3ArraySizeInBytes(this.values, sizeOfT);
    }
}

export type MO3Vector3Track = MO3TrackBase<Float3>
export type MO3Vector4Track = MO3TrackBase<Float4>
export type MO3FloatTrack = MO3TrackBase<number>
export type MO3Uint8Track = MO3TrackBase<number>
export type MO3UInt16Track = MO3TrackBase<number>

export class MO3Bone {
    index: number;
    /** Int32 */
    keyBoneId: number;
    /** Uint32 */
    flags: number;
    /** Int16 */
    parentBoneId: number;
    /** UInt16 */
    subMeshId: number;
    /** Uint32 */
    boneNameCRC: number;
    /** Float[3] */
    pivot: Float3;
    translation: MO3Vector3Track[];
    rotation: MO3Vector4Track[];
    scale: MO3Vector3Track[];

    static deserialize(buffer: BufferWrapper, index: number,) {
        const result = new MO3Bone;
        result.index = index;
        result.keyBoneId = buffer.readInt32LE();
        result.flags = buffer.readUInt32LE();
        result.parentBoneId = buffer.readInt16LE();
        result.subMeshId = buffer.readUInt16LE();
        result.boneNameCRC = buffer.readUInt32LE();
        result.pivot = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()];
        result.translation = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [buff3.readFloatLE(), buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        result.rotation = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [-buff3.readFloatLE(), -buff3.readFloatLE(), -buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        result.scale = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [buff3.readFloatLE(), buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        return result;
    }

    equals(other: MO3Bone) {
        return  this.index === other.index
        &&      this.keyBoneId === other.keyBoneId
        &&      this.flags === other.flags
        &&      this.parentBoneId === other.parentBoneId
        &&      this.subMeshId === other.subMeshId
        &&      this.boneNameCRC === other.boneNameCRC 
        &&      arraysEqual(this.pivot, other.pivot, floatEqualish)
        &&      arraysEqual(this.translation, other.translation, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
        &&      arraysEqual(this.rotation, other.rotation, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
        &&      arraysEqual(this.scale, other.scale, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeInt32LE(this.keyBoneId);
        buffer.writeUInt32LE(this.flags);
        buffer.writeInt16LE(this.parentBoneId);
        buffer.writeUInt16LE(this.subMeshId);
        buffer.writeUInt32LE(this.boneNameCRC);
        buffer.writeFloatLE(this.pivot[0]);
        buffer.writeFloatLE(this.pivot[1]);
        buffer.writeFloatLE(this.pivot[2]);
        serializeMO3Array(buffer, this.translation, (buffer, x) => {
            x.serialize(buffer, (buff2, y) => {
                buff2.writeFloatLE(y[0]);
                buff2.writeFloatLE(y[1]);
                buff2.writeFloatLE(y[2]);
            })
        });
        serializeMO3Array(buffer, this.rotation, (buffer, x) => {
            x.serialize(buffer, (buff2, y) => {
                buff2.writeFloatLE(-y[0]);
                buff2.writeFloatLE(-y[1]);
                buff2.writeFloatLE(-y[2]);
                buff2.writeFloatLE(y[3]);
            })
        });
        serializeMO3Array(buffer, this.scale, (buffer, x) => {
            x.serialize(buffer, (buff2, y) => {
                buff2.writeFloatLE(y[0]);
                buff2.writeFloatLE(y[1]);
                buff2.writeFloatLE(y[2]);
            })
        });
    }

    sizeInBytes() {
        return 28 +
            getMO3ComplexArraySizeInBytes(this.translation, 12) +
            getMO3ComplexArraySizeInBytes(this.rotation, 16) +
            getMO3ComplexArraySizeInBytes(this.scale, 12)
    }
}

export class MO3SubMesh {
    /** Uint16 */
    submeshID: number;
    /** Uint16 */
    level: number;
    /**Uint16 */
    vertexStart: number;
    /** Uint16 */
    vertexCount: number;
    /** Uint16 */
    triangleStart: number;
    /** Uint16 */
    triangleCount: number;
    /** Uint16 */
    centerBoneIndex: number;
    /** Float[3] */
    centerPosition: Float3;
    /** Float[3] */
    sortCenterPosition: Float3;
    /** Float */
    sortRadius: number;

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3SubMesh();
        result.submeshID = buffer.readUInt16LE();
        result.level = buffer.readUInt16LE();
        result.vertexStart = buffer.readUInt16LE();
        result.vertexCount = buffer.readUInt16LE();
        result.triangleStart = buffer.readUInt16LE() /*+ 65536 * result.unk2*/;
        result.triangleCount = buffer.readUInt16LE();
        result.centerBoneIndex = buffer.readUInt16LE();
        result.centerPosition = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()];
        result.sortCenterPosition = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()];
        result.sortRadius = buffer.readFloatLE();
        return result;
    }

    equals(other: MO3SubMesh) {
        return  this.submeshID === other.submeshID
        &&      this.level === other.level
        &&      this.vertexStart === other.vertexStart
        &&      this.vertexCount === other.vertexCount
        &&      this.triangleStart === other.triangleStart
        &&      this.triangleCount === other.triangleCount
        &&      this.centerBoneIndex === other.centerBoneIndex
        &&      arraysEqual(this.sortCenterPosition, other.sortCenterPosition, floatEqualish)
        &&      floatEqualish(this.sortRadius, other.sortRadius)
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeInt16LE(this.submeshID);
        buffer.writeUInt16LE(this.level);
        buffer.writeUInt16LE(this.vertexStart);
        buffer.writeUInt16LE(this.vertexCount);
        buffer.writeUInt16LE(this.triangleStart);
        buffer.writeUInt16LE(this.triangleCount);
        buffer.writeUInt16LE(this.centerBoneIndex);
        buffer.writeFloatLE(this.centerPosition[0]);
        buffer.writeFloatLE(this.centerPosition[1]);
        buffer.writeFloatLE(this.centerPosition[2]);
        buffer.writeFloatLE(this.sortCenterPosition[0]);
        buffer.writeFloatLE(this.sortCenterPosition[1]);
        buffer.writeFloatLE(this.sortCenterPosition[2]);
        buffer.writeFloatLE(this.sortRadius);
    }

    static sizeOf() {
        return 42;
    }

    sizeInBytes() {
        return 42;
    }
}

export class MO3TextureUnit {
    /** Uint8 */
    flags: number;
    /** Int8 */
    priority: number;
    /** Uint16 */
    shaderId: number;
    /** Uint16 */
    skinSectionIndex: number;
    /** Uint16 */
    flags2: number;
    /** Int16 */
    colorIndex: number;
    /** Uint16 */
    materialIndex: number;
    /** Uint16 */
    materialLayer: number;
    /** Uint16 */
    textureCount: number;
    /** Int16 */
    textureComboIndex: number;
    /** Uint16 */
    textureCoordComboIndex: number;
    /** Int16 */
    textureWeightComboIndex: number;
    /** Int16 */
    textureTransformComboIndex: number;

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3TextureUnit();
        result.flags = buffer.readUInt8();
        result.priority = buffer.readInt8();
        result.shaderId = buffer.readUInt16LE();
        result.skinSectionIndex = buffer.readUInt16LE();
        result.flags2 = buffer.readUInt16LE();
        result.colorIndex = buffer.readInt16LE();
        result.materialIndex = buffer.readUInt16LE();
        result.materialLayer = buffer.readUInt16LE();
        result.textureCount = buffer.readUInt16LE();
        result.textureComboIndex = buffer.readInt16LE();
        result.textureCoordComboIndex = buffer.readUInt16LE();
        result.textureWeightComboIndex = buffer.readInt16LE();
        result.textureTransformComboIndex = buffer.readInt16LE();
        return result;
    }

    equals(other: MO3TextureUnit) {
        return  this.flags === other.flags
        &&      this.priority === other.priority
        &&      this.shaderId === other.shaderId
        &&      this.skinSectionIndex === other.skinSectionIndex
        &&      this.flags2 === other.flags2
        &&      this.colorIndex === other.colorIndex
        &&      this.materialIndex === other.materialIndex
        &&      this.materialLayer === other.materialLayer
        &&      this.textureCount === other.textureCount
        &&      this.textureComboIndex === other.textureComboIndex
        &&      this.textureCoordComboIndex === other.textureCoordComboIndex
        &&      this.textureWeightComboIndex === other.textureWeightComboIndex
        &&      this.textureTransformComboIndex === other.textureTransformComboIndex
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeUInt8(this.flags);
        buffer.writeInt8(this.priority);
        buffer.writeUInt16LE(this.shaderId);
        buffer.writeUInt16LE(this.skinSectionIndex);
        buffer.writeUInt16LE(this.flags2);
        buffer.writeInt16LE(this.colorIndex);
        buffer.writeUInt16LE(this.materialIndex);
        buffer.writeUInt16LE(this.materialLayer);
        buffer.writeUInt16LE(this.textureCount);
        buffer.writeInt16LE(this.textureComboIndex);
        buffer.writeUInt16LE(this.textureCoordComboIndex);
        buffer.writeInt16LE(this.textureWeightComboIndex);
        buffer.writeInt16LE(this.textureTransformComboIndex);
    }

    static sizeOf() {
        return 24;
    }

    sizeInBytes() {
        return 24;
    }
}

export class MO3Material {
    /** Uint16 */
    flags: number;
    /** Uint16 */
    blendingMode: number;

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3Material();
        result.flags = buffer.readUInt16LE();
        result.blendingMode = buffer.readUInt16LE();
        return result;
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeUInt16LE(this.flags);
        buffer.writeUInt16LE(this.blendingMode);
    }

    equals(other: MO3Material) {
        return this.flags === other.flags
        &&     this.blendingMode === other.blendingMode
    }

    static sizeOf() {
        return 4;
    }

    sizeInBytes() {
        return 4;
    }
}

export class MO3Texture {
    index: number;
    /** Int32 */
    type: number;
    /** UInt32 */
    flags: number;
    /** UInt32 */
    textureId: number;

    static deserialize(buffer: BufferWrapper, index: number) {
        const result = new MO3Texture();
        result.index = index;
        result.type = buffer.readInt32LE();
        result.flags = buffer.readUInt32LE();
        result.textureId = buffer.readUInt32LE();
        return result;
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeInt32LE(this.type);
        buffer.writeUInt32LE(this.flags);
        buffer.writeUInt32LE(this.textureId);
    }

    equals(other: MO3Texture) {
        return  this.index === other.index
        &&      this.type === other.type
        &&      this.flags === other.flags
        &&      this.textureId === other.textureId
    }

    static sizeOf() {
        return 12;
    }

    sizeInBytes() {
        return 12;
    }
}

export class MO3TextureTransform {
    translation: MO3Vector3Track[];
    rotation: MO3Vector4Track[];
    scaling: MO3Vector3Track[];

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3TextureTransform();
        result.translation = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [buff3.readFloatLE(), buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        result.rotation = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [-buff3.readFloatLE(), -buff3.readFloatLE(), -buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        result.scaling = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [buff3.readFloatLE(), buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        return result;
    }

    equals(other: MO3TextureTransform) {
        return  arraysEqual(this.translation, other.translation, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
        &&      arraysEqual(this.rotation, other.rotation, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
        &&      arraysEqual(this.scaling, other.scaling, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
    }

    serialize(buffer: BufferWrapper) {
        serializeMO3Array(buffer, this.translation, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y[0]);
                buff3.writeFloatLE(y[1]);
                buff3.writeFloatLE(y[2]);
            })
        })
        serializeMO3Array(buffer, this.rotation, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y[0]);
                buff3.writeFloatLE(y[1]);
                buff3.writeFloatLE(y[2]);
                buff3.writeFloatLE(y[3]);
            })
        })
        serializeMO3Array(buffer, this.scaling, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y[0]);
                buff3.writeFloatLE(y[1]);
                buff3.writeFloatLE(y[2]);
            })
        })
    }

    sizeInBytes() {
        return (
            getMO3ComplexArraySizeInBytes(this.translation, 12) +
            getMO3ComplexArraySizeInBytes(this.rotation, 16) +
            getMO3ComplexArraySizeInBytes(this.scaling, 12)
        )
    }
}

export class MO3ModelAttachment {
    /** Int32 */
    id: number;
    /** Int32 */
    bone: number;
    /** Float[3] */
    position: Float3

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3ModelAttachment();
        result.id = buffer.readInt32LE();
        result.bone = buffer.readInt32LE();
        result.position = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()]
        return result;
    }

    equals(other: MO3ModelAttachment) {
        return this.id === other.id
        &&     this.bone === other.bone
        &&     arraysEqual(this.position, other.position, floatEqualish)
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeInt32LE(this.id);
        buffer.writeInt32LE(this.bone);
        buffer.writeFloatLE(this.position[0]);
        buffer.writeFloatLE(this.position[1]);
        buffer.writeFloatLE(this.position[2]);
    }

    static sizeOf() {
        return 20;
    }

    sizeInBytes() {
        return 20;
    }
}



export class MO3Color {
    color: MO3Vector3Track[];
    alpha: MO3UInt16Track[];

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3Color();
        result.color = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [buff3.readFloatLE(), buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        result.alpha = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readUInt16LE();
        }));
        return result;
    }

    equals(other: MO3Color) {
        return  arraysEqual(this.color, other.color, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
        &&      arraysEqual(this.alpha, other.alpha, (a,b) => a.equals(b))
    }

    serialize(buffer: BufferWrapper) {
        serializeMO3Array(buffer, this.color, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y[0]);
                buff3.writeFloatLE(y[1]);
                buff3.writeFloatLE(y[2]);
            })
        })
        serializeMO3Array(buffer, this.alpha, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeUInt16LE(y);
            })
        })
    }

    sizeInBytes() {
        return (
            getMO3ComplexArraySizeInBytes(this.color, 12) +
            getMO3ComplexArraySizeInBytes(this.alpha, 2)
        )
    }
}

export class MO3TextureWeightsContainer {
    weight: MO3UInt16Track[];

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3TextureWeightsContainer();
        result.weight = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readUInt16LE();
        }));
        return result;
    }

    equals(other: MO3TextureWeightsContainer) {
        return arraysEqual(this.weight, other.weight, (a,b) => a.equals(b))
    }

    serialize(buffer: BufferWrapper) {
        serializeMO3Array(buffer, this.weight, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeUInt16LE(y);
            })
        })
    }

    sizeInBytes() {
        return getMO3ComplexArraySizeInBytes(this.weight, 2);
    }
}

export class MO3DictBase<T> {
    /** Int16 */
    keys: number[];
    values: T[];

    static deserialize<T>(buffer: BufferWrapper, deserializeTFn: (buffer: BufferWrapper) => T) {
        const result = new MO3DictBase<T>();
        result.keys = deserializeMO3Array(buffer, (buff) => buff.readInt16LE());
        result.values = deserializeMO3Array(buffer, deserializeTFn);
        return result;
    }

    serialize(buffer: BufferWrapper, serializeTFn: (buffer: BufferWrapper, obj: T) => void) {
        serializeMO3Array(buffer, this.keys, (buff2, x) => {
            buff2.writeUInt16LE(x);
        });
        serializeMO3Array(buffer, this.values, serializeTFn);
    }

    equals(other: MO3DictBase<T>, compFn?: (a: T, b: T) => boolean) {
        return  arraysEqual(this.keys, other.keys)
        &&      arraysEqual(this.values, other.values, compFn)
    }

    sizeInBytes(sizeOfT: number) {
        return getMO3ArraySizeInBytes(this.keys, 2) +
            getMO3ArraySizeInBytes(this.keys, sizeOfT)
    }
}

export type MO3Float3Dict = MO3DictBase<Float3>;
export type MO3Float2Dict = MO3DictBase<Float2>;
export type MO3Uint16Dict = MO3DictBase<number>;

/** Probably based off M2Particle */
export class MO3ParticleEmitter {
    /** Int32 */
    particleId: number;
    /** UInt32 */
    flags: number;
    /** float[3] */
    position: Float3;
    /** Int16 */
    bone: number;
    /** Int16 */
    texture: number;
    /** UInt8 */
    blendingType: number;
    /** UInt8 */
    emitterType: number;
    /** UInt16 */
    particleColorIndex: number;
    /** UInt16 */
    textureTileRotation: number;
    /** UInt16 */
    textureDimensionRows: number;
    /** UInt16 */
    textureDimensionColumns: number;
    emissionSpeed: MO3FloatTrack[]
    speedVariation: MO3FloatTrack[]
    verticalRange: MO3FloatTrack[]
    horizontalRange: MO3FloatTrack[]
    gravity: MO3Vector3Track[]
    lifespan: MO3FloatTrack[]
    /** Float */
    lifespanVary: number;
    emissionRate: MO3FloatTrack[]
    /** Float */
    emissionRateVary: number;
    emissionAreaLength: MO3FloatTrack[]
    emissionAreaWidth: MO3FloatTrack[]
    zSource: MO3FloatTrack[]
    colorTrack: MO3Float3Dict;
    alphaTrack: MO3Uint16Dict;
    scaleTrack: MO3Float2Dict;
    scaleVary: Float2;
    headCellTrack: MO3Uint16Dict;
    tailCellTrack: MO3Uint16Dict;
    /** Float */
    tailLength: number;
    /** Float */
    twinkleSpeed: number;
    /** Float */
    twinklePercent: number;
    twinkleScale: Float2;
    /** Float */
    burstMultiplier: number;
    /** Float */
    drag: number;
    /** Float */
    baseSpin: number;
    /** Float */
    baseSpinVary: number;
    /** Float */
    spin: number;
    /** Float */
    spinVary: number;
    tumbleModelRationSpeedMin: Float3;
    tumbleModelRotationSpeedMax: Float3;
    windVector: Float3;
    /** Float */
    windTime: number;
    /** Float */
    followSpeed1: number;
    /** Float */
    followScale1: number;
    /** Float */
    followSpeed2: number;
    /** Float */
    followScale2: number;
    splinePoints: Float3[];
    enabledIn: MO3Uint8Track[];
    multiTextureParamX: Float2;
    multiTextureParam0: [Float2, Float2];
    multiTextureParam1: [Float2, Float2];

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3ParticleEmitter();
        result.particleId = buffer.readInt32LE();
        result.flags = buffer.readUInt32LE();
        result.position = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE(),]
        result.bone = buffer.readInt16LE();
        result.texture = buffer.readInt16LE();
        result.blendingType = buffer.readUInt8();
        result.emitterType = buffer.readUInt8();
        result.particleColorIndex = buffer.readUInt16LE();
        result.textureTileRotation = buffer.readUInt16LE();
        result.textureDimensionRows = buffer.readUInt16LE();
        result.textureDimensionColumns = buffer.readUInt16LE();
        result.emissionSpeed = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.speedVariation = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.verticalRange = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.horizontalRange = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.gravity = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return [buff3.readFloatLE(), buff3.readFloatLE(), buff3.readFloatLE()]
        }));
        result.lifespan = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.lifespanVary = buffer.readFloatLE();
        result.emissionRate = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.emissionRateVary = buffer.readFloatLE();
        result.emissionAreaLength = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.emissionAreaWidth = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.zSource = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readFloatLE();
        }));
        result.colorTrack = MO3DictBase.deserialize(buffer, (buff2) => {
            return [buff2.readFloatLE(), buff2.readFloatLE(), buff2.readFloatLE()]
        })
        result.alphaTrack = MO3DictBase.deserialize(buffer, (buff2) => {
            return buff2.readUInt16LE();
        })
        result.scaleTrack = MO3DictBase.deserialize(buffer, (buff2) => {
            return [buff2.readFloatLE(), buff2.readFloatLE()]
        })
        result.scaleVary = [buffer.readFloatLE(), buffer.readFloatLE()]
        result.headCellTrack = MO3DictBase.deserialize(buffer, (buff2) => {
            return buff2.readUInt16LE();
        })
        result.tailCellTrack = MO3DictBase.deserialize(buffer, (buff2) => {
            return buff2.readUInt16LE();
        })
        result.tailLength = buffer.readFloatLE();
        result.twinkleSpeed = buffer.readFloatLE();
        result.twinklePercent = buffer.readFloatLE();
        result.twinkleScale = [buffer.readFloatLE(), buffer.readFloatLE()]
        result.burstMultiplier = buffer.readFloatLE();
        result.drag = buffer.readFloatLE();
        result.baseSpin = buffer.readFloatLE();
        result.baseSpinVary = buffer.readFloatLE();
        result.spin = buffer.readFloatLE();
        result.spinVary = buffer.readFloatLE();
        result.tumbleModelRationSpeedMin = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()]
        result.tumbleModelRotationSpeedMax = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()]
        result.windVector = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()]
        result.windTime = buffer.readFloatLE();
        result.followSpeed1 = buffer.readFloatLE();
        result.followScale1 = buffer.readFloatLE();
        result.followSpeed2 = buffer.readFloatLE();
        result.followScale2 = buffer.readFloatLE();
        result.splinePoints = deserializeMO3Array(buffer, (buff2) => {
            return [buff2.readFloatLE(), buff2.readFloatLE(), buff2.readFloatLE()]
        });
        result.enabledIn = deserializeMO3Array(buffer, (buff2) => MO3TrackBase.deserialize(buff2, (buff3) => {
            return buff3.readUInt8();
        }));
        result.multiTextureParamX = [buffer.readFloatLE(), buffer.readFloatLE()]
        result.multiTextureParam0 = [[buffer.readFloatLE(), buffer.readFloatLE()], [buffer.readFloatLE(), buffer.readFloatLE()]]
        result.multiTextureParam1 = [[buffer.readFloatLE(), buffer.readFloatLE()], [buffer.readFloatLE(), buffer.readFloatLE()]]
        return result;
    }

    equals(other: MO3ParticleEmitter) {
        return this.particleId === other.particleId
        && this.particleId === other.particleId
        && this.flags === other.flags
        && arraysEqual(this.position, other.position, floatEqualish)
        && this.bone === other.bone
        && this.texture === other.texture
        && this.blendingType === other.blendingType
        && this.emitterType === other.emitterType
        && this.particleColorIndex === other.particleColorIndex
        && this.textureTileRotation === other.textureTileRotation
        && this.textureDimensionRows === other.textureDimensionRows
        && this.textureDimensionColumns === other.textureDimensionColumns
        && arraysEqual(this.emissionSpeed, other.emissionSpeed, (a,b) => a.equals(b, floatEqualish))
        && arraysEqual(this.speedVariation, other.speedVariation, (a,b) => a.equals(b, floatEqualish))
        && arraysEqual(this.verticalRange, other.verticalRange, (a,b) => a.equals(b, floatEqualish))
        && arraysEqual(this.horizontalRange, other.horizontalRange, (a,b) => a.equals(b, floatEqualish))
        && arraysEqual(this.gravity, other.gravity, (a,b) => a.equals(b, (c,d) => arraysEqual(c, d, floatEqualish)))
        && arraysEqual(this.lifespan, other.lifespan, (a,b) => a.equals(b, floatEqualish))
        && floatEqualish(this.lifespanVary, other.lifespanVary)
        && arraysEqual(this.emissionRate, other.emissionRate, (a,b) => a.equals(b, floatEqualish))
        && floatEqualish(this.emissionRateVary, other.emissionRateVary)
        && arraysEqual(this.emissionAreaLength, other.emissionAreaLength, (a,b) => a.equals(b, floatEqualish))
        && arraysEqual(this.emissionAreaWidth, other.emissionAreaWidth, (a,b) => a.equals(b, floatEqualish))
        && arraysEqual(this.zSource, other.zSource, (a,b) => a.equals(b, floatEqualish))
        && this.colorTrack.equals(other.colorTrack, (a,b) => arraysEqual(a, b, floatEqualish))
        && this.alphaTrack.equals(other.alphaTrack)
        && this.scaleTrack.equals(other.scaleTrack, (a,b) => arraysEqual(a, b, floatEqualish))
        && arraysEqual(this.scaleVary, other.scaleVary, floatEqualish)
        && this.headCellTrack.equals(other.headCellTrack)
        && this.tailCellTrack.equals(other.tailCellTrack)
        && floatEqualish(this.tailLength, other.tailLength)
        && floatEqualish(this.twinkleSpeed, other.twinkleSpeed)
        && floatEqualish(this.twinklePercent, other.twinklePercent)
        && arraysEqual(this.twinkleScale, other.twinkleScale, floatEqualish)
        && floatEqualish(this.burstMultiplier, other.burstMultiplier)
        && floatEqualish(this.drag, other.drag)
        && floatEqualish(this.baseSpin, other.baseSpin)
        && floatEqualish(this.baseSpinVary, other.baseSpinVary)
        && floatEqualish(this.spin, other.spin)
        && floatEqualish(this.spinVary, other.spinVary)
        && arraysEqual(this.tumbleModelRationSpeedMin, other.tumbleModelRationSpeedMin, floatEqualish)
        && arraysEqual(this.tumbleModelRotationSpeedMax, other.tumbleModelRotationSpeedMax, floatEqualish)
        && arraysEqual(this.windVector, other.windVector, floatEqualish)
        && floatEqualish(this.windTime, other.windTime)
        && floatEqualish(this.followSpeed1, other.followSpeed1)
        && floatEqualish(this.followScale1, other.followScale1)
        && floatEqualish(this.followSpeed2, other.followSpeed2)
        && floatEqualish(this.followScale2, other.followScale2)
        && arraysEqual(this.splinePoints, other.splinePoints, (a,b) => arraysEqual(a, b, floatEqualish))
        && arraysEqual(this.enabledIn, other.enabledIn, (a,b) => a.equals(b))
        && arraysEqual(this.multiTextureParamX, other.multiTextureParamX, floatEqualish)
        && arraysEqual(this.multiTextureParam0, other.multiTextureParam0, (a,b) => arraysEqual(a, b, floatEqualish))
        && arraysEqual(this.multiTextureParam1, other.multiTextureParam1, (a,b) => arraysEqual(a, b, floatEqualish))
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeInt32LE(this.particleId);
        buffer.writeUInt32LE(this.flags);
        buffer.writeFloatLE(this.position[0]);
        buffer.writeFloatLE(this.position[1]);
        buffer.writeFloatLE(this.position[2]);
        buffer.writeInt16LE(this.bone);
        buffer.writeInt16LE(this.texture);
        buffer.writeUInt8(this.blendingType);
        buffer.writeUInt8(this.emitterType);
        buffer.writeUInt16LE(this.particleColorIndex);
        buffer.writeUInt16LE(this.textureTileRotation);
        buffer.writeUInt16LE(this.textureDimensionRows);
        buffer.writeUInt16LE(this.textureDimensionColumns);
        serializeMO3Array(buffer, this.emissionSpeed, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        serializeMO3Array(buffer, this.speedVariation, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        serializeMO3Array(buffer, this.verticalRange, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        serializeMO3Array(buffer, this.horizontalRange, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        serializeMO3Array(buffer, this.gravity, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y[0]);
                buff3.writeFloatLE(y[1]);
                buff3.writeFloatLE(y[2]);
            })
        })
        serializeMO3Array(buffer, this.lifespan, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        buffer.writeFloatLE(this.lifespanVary);
        serializeMO3Array(buffer, this.emissionRate, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        buffer.writeFloatLE(this.emissionRateVary);
        serializeMO3Array(buffer, this.emissionAreaLength, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        serializeMO3Array(buffer, this.emissionAreaWidth, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        serializeMO3Array(buffer, this.zSource, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            })
        })
        this.colorTrack.serialize(buffer, (buff2, x) => {
            buff2.writeFloatLE(x[0]);
            buff2.writeFloatLE(x[1]);
            buff2.writeFloatLE(x[2]);
        })
        this.alphaTrack.serialize(buffer, (buff2, x) => {
            buff2.writeUInt16LE(x);
        })
        this.scaleTrack.serialize(buffer, (buff2, x) => {
            buff2.writeFloatLE(x[0]);
            buff2.writeFloatLE(x[1]);
        })
        buffer.writeFloatLE(this.scaleVary[0]);
        buffer.writeFloatLE(this.scaleVary[1]);
        this.headCellTrack.serialize(buffer, (buff2, x) => {
            buff2.writeUInt16LE(x);
        })
        this.tailCellTrack.serialize(buffer, (buff2, x) => {
            buff2.writeUInt16LE(x);
        })
        buffer.writeFloatLE(this.tailLength);
        buffer.writeFloatLE(this.twinkleSpeed);
        buffer.writeFloatLE(this.twinklePercent);
        buffer.writeFloatLE(this.twinkleScale[0]);
        buffer.writeFloatLE(this.twinkleScale[1]);
        buffer.writeFloatLE(this.burstMultiplier);
        buffer.writeFloatLE(this.drag);
        buffer.writeFloatLE(this.baseSpin);
        buffer.writeFloatLE(this.baseSpinVary);
        buffer.writeFloatLE(this.spin);
        buffer.writeFloatLE(this.spinVary);
        buffer.writeFloatLE(this.tumbleModelRationSpeedMin[0]);
        buffer.writeFloatLE(this.tumbleModelRationSpeedMin[1]);
        buffer.writeFloatLE(this.tumbleModelRationSpeedMin[2]);
        buffer.writeFloatLE(this.tumbleModelRotationSpeedMax[0]);
        buffer.writeFloatLE(this.tumbleModelRotationSpeedMax[1]);
        buffer.writeFloatLE(this.tumbleModelRotationSpeedMax[2]);
        buffer.writeFloatLE(this.windVector[0]);
        buffer.writeFloatLE(this.windVector[1]);
        buffer.writeFloatLE(this.windVector[2]);
        buffer.writeFloatLE(this.windTime);
        buffer.writeFloatLE(this.followSpeed1);
        buffer.writeFloatLE(this.followScale1);
        buffer.writeFloatLE(this.followSpeed2);
        buffer.writeFloatLE(this.followScale2);
        serializeMO3Array(buffer, this.splinePoints, (buff2, x) => {
            buff2.writeFloatLE(x[0]);
            buff2.writeFloatLE(x[1]);
            buff2.writeFloatLE(x[2]);
        })
        serializeMO3Array(buffer, this.enabledIn, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeUInt8(y);
            })
        })
        buffer.writeFloatLE(this.multiTextureParamX[0]);
        buffer.writeFloatLE(this.multiTextureParamX[1]);
        buffer.writeFloatLE(this.multiTextureParam0[0][0]);
        buffer.writeFloatLE(this.multiTextureParam0[0][1]);
        buffer.writeFloatLE(this.multiTextureParam0[1][0]);
        buffer.writeFloatLE(this.multiTextureParam0[1][1]);
        buffer.writeFloatLE(this.multiTextureParam1[0][0]);
        buffer.writeFloatLE(this.multiTextureParam1[0][1]);
        buffer.writeFloatLE(this.multiTextureParam1[1][0]);
        buffer.writeFloatLE(this.multiTextureParam1[1][1]);
    }

    sizeInBytes() {
        return 190 +
            getMO3ComplexArraySizeInBytes(this.emissionSpeed, 4) +
            getMO3ComplexArraySizeInBytes(this.speedVariation, 4) +
            getMO3ComplexArraySizeInBytes(this.verticalRange, 4) +
            getMO3ComplexArraySizeInBytes(this.horizontalRange, 4) +
            getMO3ComplexArraySizeInBytes(this.gravity, 12) +
            getMO3ComplexArraySizeInBytes(this.lifespan, 4) +
            getMO3ComplexArraySizeInBytes(this.emissionRate, 4) +
            getMO3ComplexArraySizeInBytes(this.emissionAreaLength, 4) +
            getMO3ComplexArraySizeInBytes(this.emissionAreaWidth, 4) +
            getMO3ComplexArraySizeInBytes(this.zSource, 4) +
            this.colorTrack.sizeInBytes(12) +
            this.alphaTrack.sizeInBytes(2) +
            this.scaleTrack.sizeInBytes(8) +
            this.headCellTrack.sizeInBytes(2) +
            this.tailCellTrack.sizeInBytes(2) +
            getMO3ArraySizeInBytes(this.splinePoints, 12) +
            getMO3ComplexArraySizeInBytes(this.enabledIn, 1)
    }
}


export class MO3ExtendedParticle {
    /** Float */
    zSource: number;
    /** Float */
    colorMult: number;
    /** Float */
    alphaMult: number;
    alphaCutoff: MO3Uint16Dict;

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3ExtendedParticle;
        result.zSource = buffer.readFloatLE();
        result.colorMult = buffer.readFloatLE();
        result.alphaMult = buffer.readFloatLE();
        result.alphaCutoff = MO3DictBase.deserialize(buffer, (buff2) => {
            return buff2.readUInt16LE();
        });
        return result;
    }

    equals(other: MO3ExtendedParticle) {
        return  floatEqualish(this.zSource, other.zSource)
        &&      floatEqualish(this.colorMult, other.colorMult)
        &&      floatEqualish(this.alphaMult, other.alphaMult)
        &&      this.alphaCutoff.equals(other.alphaCutoff)
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeFloatLE(this.zSource);
        buffer.writeFloatLE(this.colorMult);
        buffer.writeFloatLE(this.alphaMult);
        this.alphaCutoff.serialize(buffer, (buff2, x) => {
            buff2.writeUInt16LE(x);
        })
    }

    sizeInBytes() {
        return 12 + this.alphaCutoff.sizeInBytes(2);
    }
}

export class MO3RibbonEmitter {
    /** Int32 */
    ribbonId: number;
    /** Int32 */
    boneIndex: number;
    position: Float3;
    /** Int16[] */
    textureIndices: number[]
    /** Int16[] */
    materialIndices: number[]
    colorTrack: MO3Vector3Track[]
    alphaTrack: MO3UInt16Track[]
    heightAboveTrack: MO3FloatTrack[]
    heightBelowTrack: MO3FloatTrack[]
    /** Float */
    edgesPerSecond: number;
    /** Float */
    edgeLifetime: number;
    /** Float */
    gravity: number;
    /** Int16 */
    textureRows: number
    /** Int16 */
    textureCols: number
    texSlotTrack: MO3UInt16Track[]
    visibilityTrack: MO3Uint8Track[]
    /** Int16 */
    priorityPlane: number

    static deserialize(buffer: BufferWrapper) {
        const result = new MO3RibbonEmitter;
        result.ribbonId = buffer.readInt32LE();
        result.boneIndex = buffer.readInt32LE();
        result.position = [buffer.readFloatLE(), buffer.readFloatLE(), buffer.readFloatLE()];
        result.textureIndices = deserializeMO3Array(buffer, (buff) => buff.readInt16LE());
        result.materialIndices = deserializeMO3Array(buffer, (buff) => buff.readInt16LE());
        result.colorTrack = deserializeMO3Array(buffer, (buff) => MO3TrackBase.deserialize(buff, (buff2 => {
            return [buff2.readFloatLE(), buff2.readFloatLE(), buff2.readFloatLE()]
        })));
        result.alphaTrack = deserializeMO3Array(buffer, (buff) => MO3TrackBase.deserialize(buff, (buff2 => {
            return buff2.readUInt16LE();
        })));
        result.heightAboveTrack = deserializeMO3Array(buffer, (buff) => MO3TrackBase.deserialize(buff, (buff2 => {
            return buff2.readFloatLE();
        })));
        result.heightBelowTrack = deserializeMO3Array(buffer, (buff) => MO3TrackBase.deserialize(buff, (buff2 => {
            return buff2.readFloatLE();
        })));
        result.edgesPerSecond = buffer.readFloatLE();
        result.edgeLifetime = buffer.readFloatLE();
        result.gravity = buffer.readFloatLE();
        result.textureRows = buffer.readInt16LE();
        result.textureCols = buffer.readInt16LE();
        result.texSlotTrack = deserializeMO3Array(buffer, (buff) => MO3TrackBase.deserialize(buff, (buff2 => {
            return buff2.readUInt16LE();
        })));
        result.visibilityTrack = deserializeMO3Array(buffer, (buff) => MO3TrackBase.deserialize(buff, (buff2 => {
            return buff2.readUInt8();
        })));
        result.priorityPlane = buffer.readInt16LE();
        return result;
    }

    equals(other: MO3RibbonEmitter) {
    return this.ribbonId === other.ribbonId
        && this.boneIndex === other.boneIndex
        && arraysEqual(this.position, other.position, floatEqualish)
        && arraysEqual(this.textureIndices, other.textureIndices)
        && arraysEqual(this.materialIndices, other.materialIndices)
        && arraysEqual(this.colorTrack, other.colorTrack, (a, b) => a.equals(b, (c,d) => arraysEqual(c,d, floatEqualish)))
        && arraysEqual(this.alphaTrack, other.alphaTrack, (a, b) => a.equals(b))
        && arraysEqual(this.heightAboveTrack, other.heightAboveTrack, (a, b) => a.equals(b, floatEqualish))
        && arraysEqual(this.heightBelowTrack, other.heightAboveTrack, (a, b) => a.equals(b, floatEqualish))
        && floatEqualish(this.edgesPerSecond, other.edgesPerSecond)
        && floatEqualish(this.edgeLifetime, other.edgeLifetime)
        && floatEqualish(this.gravity, other.gravity)
        && this.textureRows === other.textureRows
        && this.textureCols === other.textureCols
        && arraysEqual(this.texSlotTrack, other.texSlotTrack, (a, b) => a.equals(b))
        && arraysEqual(this.visibilityTrack, other.visibilityTrack, (a, b) => a.equals(b))
        && this.priorityPlane === other.priorityPlane
    }

    serialize(buffer: BufferWrapper) {
        buffer.writeInt32LE(this.ribbonId);
        buffer.writeInt32LE(this.boneIndex);
        buffer.writeFloatLE(this.position[0]);
        buffer.writeFloatLE(this.position[1]);
        buffer.writeFloatLE(this.position[2]);
        serializeMO3Array(buffer, this.textureIndices, (buff2, x) => buff2.writeInt16LE(x));
        serializeMO3Array(buffer, this.materialIndices, (buff2, x) => buff2.writeInt16LE(x));
        serializeMO3Array(buffer, this.colorTrack, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y[0]);
                buff3.writeFloatLE(y[1]);
                buff3.writeFloatLE(y[2]);
            });
        });
        serializeMO3Array(buffer, this.alphaTrack, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeUInt16LE(y);
            });
        });
        serializeMO3Array(buffer, this.heightAboveTrack, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            });
        });
        serializeMO3Array(buffer, this.heightBelowTrack, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeFloatLE(y);
            });
        });
        buffer.writeFloatLE(this.edgesPerSecond);
        buffer.writeFloatLE(this.edgeLifetime);
        buffer.writeFloatLE(this.gravity);
        buffer.writeInt16LE(this.textureRows);
        buffer.writeInt16LE(this.textureCols);
        serializeMO3Array(buffer, this.texSlotTrack, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeUInt16LE(y);
            });
        });
        serializeMO3Array(buffer, this.visibilityTrack, (buff2, x) => {
            x.serialize(buff2, (buff3, y) => {
                buff3.writeUInt8(y);
            });
        });
        buffer.writeInt16LE(this.priorityPlane);
    }

    sizeInBytes() {
        return 38 +
            getMO3ArraySizeInBytes(this.textureIndices, 2) +
            getMO3ArraySizeInBytes(this.materialIndices, 2) +
            getMO3ComplexArraySizeInBytes(this.colorTrack, 12) +
            getMO3ComplexArraySizeInBytes(this.alphaTrack, 2) +
            getMO3ComplexArraySizeInBytes(this.heightAboveTrack, 4) +
            getMO3ComplexArraySizeInBytes(this.heightBelowTrack, 4) +
            getMO3ComplexArraySizeInBytes(this.texSlotTrack, 2) +
            getMO3ComplexArraySizeInBytes(this.visibilityTrack, 2);
    }
}

export function deserializeMO3string(buffer: BufferWrapper, length?: number) {
    if (length === undefined) {
        length = buffer.readUInt16LE();
    }
    let result = "";
    for (let i = 0; i < length; i++) {
        result += String.fromCharCode(buffer.readUInt8());
    }
    return result;
}

export function serializeMO3string(buffer: BufferWrapper, toWrite: string) {
    buffer.writeUInt16LE(toWrite.length);
    for (var i = 0; i < toWrite.length; i++) {
        buffer.writeUInt8(toWrite.charCodeAt(i));
    }
}

export function getMO3StringLengthInBytes(arr: string) {
    return 2 + arr.length;
}

export function deserializeMO3Array<T>(data: BufferWrapper, deserializeFn: (data: BufferWrapper) => T): T[] {
    const elems = data.readInt32LE();
    if (elems > 0) {
        const result = new Array(elems);
        for (let i = 0; i < elems; i++) {
            result[i] = deserializeFn(data);
        }
        return result;
    }
    return [];
}

export function getMO3ArraySizeInBytes(arr: any[], elemSize: number) {
    return 4 + arr.length * elemSize;
}

export function serializeMO3Array<T>(buffer: BufferWrapper, data: T[], serializeTFn: (data: BufferWrapper, obj: T) => void) {
    buffer.writeInt32LE(data.length);
    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            serializeTFn(buffer, data[i]);
        }
    }
}

export function getMO3ComplexArraySizeInBytes(arr: MO3Serializable[], elemSize?: number) {
    return 4 + arr.reduce((acc, next) => acc + next.sizeInBytes(elemSize), 0);
}