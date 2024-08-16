import BufferWrapper from "../../buffer";
import { C3Vector, C2Vector, C4Quaternion, CAxisAlignedBox, Fixed16, Fixed_Point, CRange, deserializeFixed16 } from "../commonTypes";

export function deserializeM2Array<T>(buffer: BufferWrapper, startingOffset: number, deserializeFn: (buffer: BufferWrapper, startingOffset: number, i: number) => T) {
    const arrayLength = buffer.readUInt32LE();
    const arrayOffset = buffer.readUInt32LE();

    const result: T[] = new Array(arrayLength);

    const currentOffset = buffer.offset;
    buffer.seek(startingOffset + arrayOffset);
    for (let i = 0; i < arrayLength; i++) {
        result[i] = deserializeFn(buffer, startingOffset, i);
    }
    buffer.seek(currentOffset);

    return result;
}


export function deserializeM2String(buffer: BufferWrapper, startingOffset: number) {
    const stringLength = buffer.readUInt32LE();
    const stringOffset = buffer.readUInt32LE();

    const currentOffset = buffer.offset;
    buffer.seek(startingOffset + stringOffset);
    const result = buffer.readString(stringLength);
    buffer.seek(currentOffset);

    return result;
}

export class M2TrackBase {
    /** uint16_t */
    interpolationType: number;
    /** uint16_t */
    globalSequence: number;
    /** uint32_t */
    timestamps: number[][];

    constructor() {
        this.timestamps = [];
        this.interpolationType = 0;
        this.globalSequence = 0;
    }

    static deserialize(buffer: BufferWrapper, startingOffset: number) {
        const result = new M2TrackBase();
        result.interpolationType = buffer.readUInt16LE();
        result.globalSequence = buffer.readUInt16LE();
        result.timestamps = deserializeM2Array(buffer, startingOffset, (buffer2, offset) => {
            return deserializeM2Array(buffer2, offset, (buffer3) => buffer3.readInt32LE())
        });
        return result;
    }
}

export class M2Track<T>{
    /** uint16_t */
    interpolationType: number;
    /** uint16_t */
    globalSequence: number;
    /** int32_t */
    timestamps: number[][];
    values: T[][];

    timeStampsOutOfSequence: [number, number][]
    valuesOutOfSequence: [number, number][]

    constructor() {
        this.timestamps = [];
        this.values = [];
        this.interpolationType = 0;
        this.globalSequence = 0;
        this.timeStampsOutOfSequence = [];
        this.valuesOutOfSequence = [];
    }

    static deserialize<T>(buffer: BufferWrapper,
        startingOffset: number,
        deserializeTFn: (buffer: BufferWrapper, offset: number) => T,
        sequences: M2Sequence[]
    ) {
        const result = new M2Track<T>();
        result.interpolationType = buffer.readUInt16LE();
        result.globalSequence = buffer.readInt16LE();

        result.timestamps = deserializeM2Array(buffer, startingOffset, (buffer2, offset, i) => {
            let anim = sequences[i];
            let flags = anim ? anim.flags : 0;
            while(flags & 0x40) {
                anim = sequences[anim.aliasNext];
                flags = anim ? anim.flags : 0;
            }
            if (flags & 0x20) {
                result.timeStampsOutOfSequence.push([-1, -1]);
                return deserializeM2Array(buffer2, offset, (buffer3) => buffer3.readInt32LE())
            } else {
                result.timeStampsOutOfSequence.push([buffer.readUInt32LE(), buffer.readUInt32LE()]);
                return [];
            }
        });
        result.values = deserializeM2Array(buffer, startingOffset, (buffer2, offset, i) => {
            let anim = sequences[i];
            let flags = anim ? anim.flags : 0;
            while (flags & 0x40) {
                anim = sequences[anim.aliasNext];
                flags = anim ? anim.flags : 0;
            }
            if (flags & 0x20) {
                result.valuesOutOfSequence.push([-1, -1]);
                return deserializeM2Array(buffer2, offset, deserializeTFn)
            } else {
                result.valuesOutOfSequence.push([buffer.readUInt32LE(), buffer.readUInt32LE()]);
                return [];
            }
        })
        return result;
    }
}

export class M2SplineKey<T> {
    value: T;
    inTan: T;
    outTan: T;

    static deserialize<T>(buffer: BufferWrapper, startingOffset: number, deserializeTFn: (buffer: BufferWrapper, offset: number) => T) {
        const result = new M2SplineKey<T>();
        result.value = deserializeTFn(buffer, startingOffset);
        result.inTan = deserializeTFn(buffer, startingOffset);
        result.outTan = deserializeTFn(buffer, startingOffset);
        return result;
    }
}

/** https://wowdev.wiki/M2#The_Fake-AnimationBlock */
export class M2Dict<T> {
    /** uint16[] */
    keys: number[];
    values: T[];

    constructor() {
        this.keys = [];
        this.values = [];
    }

    static deserialize<T>(buffer: BufferWrapper, startingOffset: number, deserializeTFn: (buffer: BufferWrapper, offset: number) => T) {
        const result = new M2Dict<T>();
        result.keys = deserializeM2Array(buffer, startingOffset, (buff2 => buff2.readUInt16LE()))
        result.values = deserializeM2Array(buffer, startingOffset, deserializeTFn);
        return result;
    }
}

export class M2Range {
    /** uint32_t */
    minimum: number;
    /** uint32_t */
    maximum: number;

    constructor() {
        this.minimum = 0;
        this.maximum = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new M2Range();
        result.minimum = buffer.readUInt32LE();
        result.maximum = buffer.readUInt32LE();
        return result;
    }
}

export class M2Bounds {
    extent: CAxisAlignedBox
    /** float */
    radius: number;

    constructor() {
        this.extent = new CAxisAlignedBox();;
        this.radius = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new M2Bounds();
        result.extent = CAxisAlignedBox.deserialize(buffer);
        result.radius = buffer.readFloatLE();
        return result;
    }
}

/** https://wowdev.wiki/Quaternion_values_and_2.x */
export class M2CompQuat {
    /** int16 */
    x: number;
    /** int16 */
    y: number;
    /** int16 */
    z: number;
    /** int16 */
    w: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new M2CompQuat();
        result.x = buffer.readInt16LE();
        result.y = buffer.readInt16LE();
        result.z = buffer.readInt16LE();
        result.w = buffer.readInt16LE();
        return result;
    }
}

export class M2Box {
    modelRotationSpeedMin: C3Vector;
    modelRotationSpeedMax: C3Vector;

    constructor() {
        this.modelRotationSpeedMin = new C3Vector();
        this.modelRotationSpeedMin = new C3Vector();
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new M2Box();
        result.modelRotationSpeedMin = C3Vector.deserialize(buffer);
        result.modelRotationSpeedMax = C3Vector.deserialize(buffer);
        return result;
    }
}

export class M2Loop {
    /** uint32_t */
    timestamp: number;

    constructor() {
        this.timestamp = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new M2Loop();
        result.timestamp = buffer.readUInt32LE();
        return result;
    }
}

export enum M2CompBoneFlags {
    ignoreParentTranslate = 0x1,
    ignoreParentScale = 0x2,
    ignoreParentRotation = 0x4,
    spherical_billboard = 0x8,
    cylindrical_billboard_lock_x = 0x10,
    cylindrical_billboard_lock_y = 0x20,
    cylindrical_billboard_lock_z = 0x40,
    transformed = 0x200,
    kinematic_bone = 0x400,       // MoP+: allow physics to influence this bone
    helmet_anim_scaled = 0x1000,  // set blend_modificator to helmetAnimScalingRec.m_amount for this bone
    something_sequence_id = 0x2000, // <=bfa+, parent_bone+submesh_id are a sequence id instead?!
}

export class M2Vertex {
    pos: C3Vector;
    /** uint8 */
    boneWeights: [number, number, number, number];
    /** uint8 */
    boneIndices: [number, number, number, number];
    normal: C3Vector;
    texCoords: [C2Vector, C2Vector];

    constructor() {
        this.pos = new C3Vector();
        this.boneWeights = [0, 0, 0, 0];
        this.boneIndices = [0, 0, 0, 0];
        this.normal = new C3Vector();
        this.texCoords = [new C2Vector(), new C2Vector()]
    }

    static deserialize(buffer: BufferWrapper, startingOffset: number) {
        const result = new M2Vertex();
        result.pos = C3Vector.deserialize(buffer);
        result.boneWeights = [buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8()]
        result.boneIndices = [buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8(), buffer.readUInt8()]
        result.normal = C3Vector.deserialize(buffer);
        result.texCoords = [C2Vector.deserialize(buffer), C2Vector.deserialize(buffer)]
        return result;
    }
}

export enum M2TextureType {
    None = 0,
    Skin = 1,
    ObjectSkin = 2,
    WeaponBlade = 3,
    WeaponHandle = 4,
    Environment = 5,
    CharHair = 6,
    CharFacialHair = 7,
    SkinExtra = 8,
    UISkin = 9,
    TaurenMane = 10,
    Monster1 = 11,
    Monster2 = 12,
    Monster3 = 13,
    ItemIcon = 14,
    GuildBackgroundColor = 15,
    GuildEmblemColor = 16,
    GuildBorderColor = 17,
    GuildEmblem = 18,
    CharEyes = 19,
    CharJewelry = 20,
    CharSecondarySkin = 21,
    CharSecondaryHair = 22,
    CharSecondaryArmor = 23,
    Unknown24 = 24,
    Unknown25 = 25,
    Unknown26 = 26,
}

export enum M2TextureFlags {
    None = 0x0,
    TextureWrapX = 0x1,
    TextureWrapY = 0x2
}

export class M2Texture {
    /** uint32_t */
    type: M2TextureType;
    /** uint32_t */
    flags: M2TextureFlags;
    filename: string;
    fileId: number;

    constructor() {
        this.type = 0;
        this.flags = M2TextureFlags.None;
        this.filename = "";
        this.fileId = 0;
    }

    static deserialize(buffer: BufferWrapper, startingOffset: number) {
        const result = new M2Texture();
        result.type = buffer.readUInt32LE();
        result.flags = buffer.readUInt32LE();
        result.filename = deserializeM2String(buffer, startingOffset);
        return result;
    }
}

export enum M2MaterialFlags {
    None = 0x0,
    Unlit = 0x01,
    Unfogged = 0x02,
    TwoSided = 0x04,
    DepthTest = 0x08,
    DepthWrite = 0x10,
    Unknown_0x40 = 0x40,
    Unknown_0x80 = 0x80,
    Unknown_0x100 = 0x100,
    Unknown_0x200 = 0x200,
    Unknown_0x400 = 0x400,
    PreventAlphaForCustomElements = 0x800,
}

export class M2Material {
    /** uint16_t */
    flags: M2MaterialFlags;
    /** uint16_t */
    blendingMode: number;

    constructor() {
        this.flags = 0;
        this.blendingMode = 0;
    }

    static deserialize(buffer: BufferWrapper, startingOffset: number) {
        const result = new M2Material();
        result.flags = buffer.readUInt16LE();
        result.blendingMode = buffer.readUInt16LE();
        return result;
    }
}

export class M2Event {
    /** uint32_t */
    identifier: number;
    /** uint32_t */
    data: number;
    /** uint32_t */
    bone: number;
    position: C3Vector;
    enabled: M2TrackBase;

    constructor() {
        this.identifier = 0;
        this.data = 0;
        this.bone = 0;
        this.position = new C3Vector();
        this.enabled = new M2TrackBase();
    }

    static deserialize(buffer: BufferWrapper, startingOffset: number) {
        const result = new M2Event();
        result.identifier = buffer.readUInt32LE();
        result.data = buffer.readUInt32LE();
        result.bone = buffer.readUInt32LE();
        result.position = C3Vector.deserialize(buffer);
        result.enabled = M2TrackBase.deserialize(buffer, startingOffset);
        return result;
    }
}

export class M2Camera {
    /** uint32_t */
    type: number;
    /** float */
    farClip: number;
    /** float */
    nearClip: number;
    positions: M2Track<M2SplineKey<C3Vector>>;
    positionBase: C3Vector;
    targetPosition: M2Track<M2SplineKey<C3Vector>>;
    targetPositionBase: C3Vector;
    /** M2Track<M2SplineKey<float>> */
    roll: M2Track<M2SplineKey<number>>;
    /** M2Track<M2SplineKey<float>> */
    fov: M2Track<M2SplineKey<number>>;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2Camera();
        result.type = buffer.readUInt32LE();
        result.farClip = buffer.readFloatLE();
        result.nearClip = buffer.readFloatLE();
        result.positions = M2Track.deserialize(buffer, startingOffset, (buff2, off2) => {
            return M2SplineKey.deserialize(buff2, off2, C3Vector.deserialize)
        }, sequences)
        result.positionBase = C3Vector.deserialize(buffer);
        result.targetPosition = M2Track.deserialize(buffer, startingOffset, (buff2, off2) => {
            return M2SplineKey.deserialize(buff2, off2, C3Vector.deserialize)
        }, sequences)
        result.targetPositionBase = C3Vector.deserialize(buffer);
        result.roll = M2Track.deserialize(buffer, startingOffset, (buff2, off2) => {
            return M2SplineKey.deserialize(buff2, off2, (buff3) => buff3.readFloatLE())
        }, sequences)
        result.fov = M2Track.deserialize(buffer, startingOffset, (buff2, off2) => {
            return M2SplineKey.deserialize(buff2, off2, (buff3) => buff3.readFloatLE())
        }, sequences)
        return result;
    }
}

export class M2Ribbon {
    /** int32_t */
    ribbonId: number;
    /** int32_t */
    boneIndex: number;
    position: C3Vector;
    /** int16_t[] */
    textureIndices: number[];
    /** int16_t[] */
    materialIndices: number[];
    colorTrack: M2Track<C3Vector>;
    /** M2Track<Fixed16> */
    alphaTrack: M2Track<Fixed16>;
    /** M2Track<float> */
    heightAboveTrack: M2Track<number>;
    /** M2Track<float> */
    heightBelowTrack: M2Track<number>;
    /** float */
    edgesPerSecond: number;
    /** float */
    edgeLifetime: number;
    /** float */
    gravity: number;
    /** uint16_t */
    textureRows: number;
    /** uint16_t */
    textureCols: number;
    /** M2Track<uint16_t> */
    texSlotTrack: M2Track<number>;
    /** M2Track<uchar> */
    visibilityTrack: M2Track<number>;
    /** uint16_t */
    priorityPlane: number;
    /** uint8_t */
    ribbonColorIndex: number;
    /** uint8_t */
    textureTransformLookupIndex: number;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2Ribbon();
        result.ribbonId = buffer.readInt32LE();
        result.boneIndex = buffer.readInt32LE();
        result.position = C3Vector.deserialize(buffer);
        result.textureIndices = deserializeM2Array(buffer, startingOffset, (buff2) => buff2.readInt16LE());
        result.materialIndices = deserializeM2Array(buffer, startingOffset, (buff2) => buff2.readInt16LE());
        result.colorTrack = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences);
        result.alphaTrack = M2Track.deserialize(buffer, startingOffset, deserializeFixed16, sequences);
        result.heightAboveTrack = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.heightBelowTrack = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.edgesPerSecond = buffer.readFloatLE();
        result.edgeLifetime = buffer.readFloatLE();
        result.gravity = buffer.readFloatLE();
        result.textureRows = buffer.readInt16LE();
        result.textureCols = buffer.readInt16LE();
        result.texSlotTrack = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readUInt16LE(), sequences);
        result.visibilityTrack = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readUInt8(), sequences);
        result.priorityPlane = buffer.readInt16LE();
        result.ribbonColorIndex = buffer.readUInt8();
        result.textureTransformLookupIndex = buffer.readUInt8();
        return result;
    }
}

export enum M2ParticleFlags {
    AffectedByLighting = 0x01,
    Unknown_0x02 = 0x02,
    OrientationIsAffectedByPlayerOrientation = 0x04,
    TravelUpInWorldspace = 0x08,
    DoNotTrail = 0x10,
    Unlightning = 0x20,
    UseBurstMulitpler = 0x40,
    ParticlesInModelSpace = 0x80,
    Unknown_0x100 = 0x100,
    Unknown_0x200 = 0x200,
    PinnedParticles = 0x400,
    Unknown_0x800 = 0x800,
    XYQuadParticles = 0x1000,
    ClampToGround = 0x2000,
    Unknown_0x4000 = 0x4000,
    Unknown_0x8000 = 0x8000,
    ChooseRandomTexture = 0x10000,
    OutwardParticles = 0x20000,
    Unknown_0x40000 = 0x40000,
    ScaleVaryAffectsXAndYIndependently = 0x80000,
    Unknown_0x100000 = 0x100000,
    RandomFlipBookStart = 0x200000,
    IgnoreDistance = 0x400000,
    GravityValuesAreCompressedVectors = 0x800000,
    BoneGeneratorIsBoneAndNotJoint = 0x1000000,
    Unknown_0x2000000 = 0x2000000,
    DoNotThrottleEmissionRateBasedOnDistance = 0x4000000,
    Unknown_0x8000000 = 0x8000000,
    UsesMultiTexturing = 0x10000000,
}

export class M2ParticleMultiTextureParameter {
    /** fixed_point<uint16_t, 6, 9> */
    x: Fixed_Point<6, 9>
    /** fixed_point<uint16_t, 6, 9> */
    y: Fixed_Point<6, 9>

    static deserialize(buffer: BufferWrapper) {
        const result = new M2ParticleMultiTextureParameter();
        result.x = new Fixed_Point<6, 9>(buffer.readUInt16LE(), 6, 9);
        result.y = new Fixed_Point<6, 9>(buffer.readUInt16LE(), 6, 9);
        return result;
    }
}

export class M2ParticleEmitter {
    /** uint32 */
    particleId: number;
    /** uint32 */
    flags: M2ParticleFlags;
    position: C3Vector;
    /** uint16 */
    bone: number;
    /** uint16 (technically 3 5 bit numbers packed in here but let's ignore that for now) */
    texture: number;
    /** M2Array<char> */
    geometryModelFileName: string
    /** M2Array<char> */
    recursionModelFileName: string
    /** uint8  */
    blendingType: number;
    /** uint8  */
    emitterType: number;
    /** uint16  */
    particleColorIndex: number;
    /** fixed_point<uint8_t, 2, 5>  */
    multiTextureParamX: [Fixed_Point<2, 5>, Fixed_Point<2, 5>];
    /** uint16  */
    textureTileRotation: number;
    /** uint16  */
    textureDimensionsRows: number;
    /** uint16  */
    textureDimensionsColumns: number;
    /** M2Track<Float> */
    emissionSpeed: M2Track<number>;
    /** M2Track<Float> */
    speedVariation: M2Track<number>;
    /** M2Track<Float> */
    verticalRange: M2Track<number>;
    /** M2Track<Float> */
    horizontalRange: M2Track<number>;
    /** Weird one */
    gravity: M2Track<C3Vector>;
    /** M2Track<Float> */
    lifespan: M2Track<number>;
    /** float */
    lifespanVary: number;
    /** M2Track<Float> */
    emissionRate: M2Track<number>;
    /** float */
    emissionRateVary: number;
    /** M2Track<Float> */
    emissionAreaLength: M2Track<number>;
    /** M2Track<Float> */
    emissionAreaWidth: M2Track<number>;
    /** M2Track<Float> */
    zSource: M2Track<number>;
    colorTrack: M2Dict<C3Vector>;
    /** M2FBlock<fixed16> */
    alphaTrack: M2Dict<Fixed16>;
    scaleTrack: M2Dict<C2Vector>;
    scaleVary: C2Vector;
    /** FBlock<uint16> */
    headCellTrack: M2Dict<number>;
    /** FBlock<uint16> */
    tailCellTrack: M2Dict<number>;
    /** float */
    tailLength: number;
    /** float */
    twinkleSpeed: number;
    /** float */
    twinklePercent: number;
    twinkleScale: CRange;
    /** float */
    burstMultiplier: number;
    /** float */
    drag: number;
    /** float */
    baseSpin: number;
    /** float */
    baseSpinVary: number;
    /** float */
    spin: number;
    /** float */
    spinVary: number;
    tumble: M2Box;
    windVector: C3Vector;
    /** float */
    windTime: number;
    /** float */
    followSpeed1: number;
    /** float */
    followScale1: number;
    /** float */
    followSpeed2: number;
    /** float */
    followScale2: number;
    splinePoints: C3Vector[];
    /** M2Track<uchar> */
    enabledIn: M2Track<number>
    multiTextureParam0: [M2ParticleMultiTextureParameter, M2ParticleMultiTextureParameter]
    multiTextureParam1: [M2ParticleMultiTextureParameter, M2ParticleMultiTextureParameter]

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2ParticleEmitter();
        result.particleId = buffer.readInt32LE();
        result.flags = buffer.readUInt32LE();
        result.position = C3Vector.deserialize(buffer);
        result.bone = buffer.readUInt16LE();
        result.texture = buffer.readUInt16LE();
        result.geometryModelFileName = deserializeM2String(buffer, startingOffset);
        result.recursionModelFileName = deserializeM2String(buffer, startingOffset);
        result.blendingType = buffer.readUInt8();
        result.emitterType = buffer.readUInt8();
        result.particleColorIndex = buffer.readUInt16LE();
        result.multiTextureParamX = [
            new Fixed_Point<2, 5>(buffer.readUInt8(), 2, 5),
            new Fixed_Point<2, 5>(buffer.readUInt8(), 2, 5)
        ]
        result.textureTileRotation = buffer.readUInt16LE();
        result.textureDimensionsRows = buffer.readUInt16LE();
        result.textureDimensionsColumns = buffer.readUInt16LE();
        result.emissionSpeed = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.speedVariation = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.verticalRange = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.horizontalRange = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.gravity = M2Track.deserialize(buffer, startingOffset, (buff2) => {
            return M2ParticleEmitter.deserializeGravity(result.flags, buff2)
        }, sequences);
        result.lifespan = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.lifespanVary = buffer.readFloatLE();
        result.emissionRate = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.emissionRateVary = buffer.readFloatLE();
        result.emissionAreaLength = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.emissionAreaWidth = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.zSource = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.colorTrack = M2Dict.deserialize(buffer, startingOffset, C3Vector.deserialize);
        result.alphaTrack = M2Dict.deserialize(buffer, startingOffset, deserializeFixed16);
        result.scaleTrack = M2Dict.deserialize(buffer, startingOffset, C2Vector.deserialize);
        result.scaleVary = C2Vector.deserialize(buffer);
        result.headCellTrack = M2Dict.deserialize(buffer, startingOffset, (buff2) => buff2.readUInt16LE());
        result.tailCellTrack = M2Dict.deserialize(buffer, startingOffset, (buff2) => buff2.readUInt16LE());
        result.tailLength = buffer.readFloatLE();
        result.twinkleSpeed = buffer.readFloatLE();
        result.twinklePercent = buffer.readFloatLE();
        result.twinkleScale = CRange.deserialize(buffer);
        result.burstMultiplier = buffer.readFloatLE();
        result.drag = buffer.readFloatLE();
        result.baseSpin = buffer.readFloatLE();
        result.baseSpinVary = buffer.readFloatLE();
        result.spin = buffer.readFloatLE();
        result.spinVary = buffer.readFloatLE();
        result.tumble = M2Box.deserialize(buffer);
        result.windVector = C3Vector.deserialize(buffer);
        result.windTime = buffer.readFloatLE();
        result.followSpeed1 = buffer.readFloatLE();
        result.followScale1 = buffer.readFloatLE();
        result.followSpeed2 = buffer.readFloatLE();
        result.followScale2 = buffer.readFloatLE();
        result.splinePoints = deserializeM2Array(buffer, startingOffset, C3Vector.deserialize);
        result.enabledIn = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readUInt8(), sequences)
        result.multiTextureParam0 = [
            M2ParticleMultiTextureParameter.deserialize(buffer),
            M2ParticleMultiTextureParameter.deserialize(buffer)
        ]
        result.multiTextureParam1 = [
            M2ParticleMultiTextureParameter.deserialize(buffer),
            M2ParticleMultiTextureParameter.deserialize(buffer)
        ]
        return result;
    }

    static deserializeGravity(flags: number, buffer: BufferWrapper) {
        if (flags & 0x800000) {
            let dir = new C3Vector();
            dir.x = buffer.readInt8();
            dir.y = buffer.readInt8();
            dir.z = 0;
            dir = dir.scale(1.0 / 128.0);
            let z = Math.sqrt(1 - dir.dot(dir));
            let mag = buffer.readInt16LE() * 0.04238648;
            if (mag < 0) {
                z = -z;
                mag = -mag;
            }
            dir.z = z;
            dir = dir.scale(mag);
            return dir;
        } else {
            let dir = new C3Vector();
            dir.x = 0;
            dir.y = 0;
            dir.z = -buffer.readFloatLE();
            return dir;
        }
    }
}

export class M2Sequence {
    /** uint16_t */
    id: number;
    /** uint16_t */
    variationIndex: number;
    /** uint32_t */
    duration: number;
    /** float */
    movespeed: number;
    /** uint32_t */
    flags: number;
    /** int16_t */
    frequency: number;
    /** uint16_t */
    padding: number;
    replay: M2Range;
    /** uint16_t */
    blendTimeIn: number;
    /** uint16_t */
    blendTimeOut: number;
    bounds: M2Bounds;
    /** int16_t */
    variationNext: number;
    /** uint16_t */
    aliasNext: number;

    static deserialize(buffer: BufferWrapper) {
        const result = new M2Sequence();
        result.id = buffer.readUInt16LE();
        result.variationIndex = buffer.readUInt16LE();
        result.duration = buffer.readUInt32LE();
        result.movespeed = buffer.readFloatLE();
        result.flags = buffer.readUInt32LE();
        result.frequency = buffer.readUInt16LE();
        result.padding = buffer.readUInt16LE();
        result.replay = M2Range.deserialize(buffer);
        result.blendTimeIn = buffer.readUInt16LE();
        result.blendTimeOut = buffer.readUInt16LE();
        result.bounds = M2Bounds.deserialize(buffer);
        result.variationNext = buffer.readInt16LE();
        result.aliasNext = buffer.readUInt16LE();
        return result;
    }
}

export class M2ExtendedParticle {
    /** float */
    zSource: number;
    /** float */
    colorMult: number;
    /** float */
    alphaMult: number;
    /** M2PartTrack<fixed16> */
    alphaCutoff: M2Dict<Fixed16>

    static deserialize(buffer: BufferWrapper, startingOffset: number): M2ExtendedParticle {
        const result = new M2ExtendedParticle();
        result.zSource = buffer.readFloatLE();
        result.colorMult = buffer.readFloatLE();
        result.alphaMult = buffer.readFloatLE();
        result.alphaCutoff = M2Dict.deserialize(buffer, startingOffset, () => new Fixed_Point<0, 15>(buffer.readUInt16LE(), 0, 15))
        return result;
    }
}

export class M2CompBone {
    /** int32_t */
    keyBoneId: number;
    /** uint32_t */
    flags: M2CompBoneFlags;
    /** int16_t */
    parentBone: number;
    /** uint16_t */
    subMeshId: number;
    /** uint32_t */
    boneNameCRC: number;
    translation: M2Track<C3Vector>;
    rotation: M2Track<M2CompQuat>;
    scale: M2Track<C3Vector>;
    pivot: C3Vector;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2CompBone();
        result.keyBoneId = buffer.readInt32LE();
        result.flags = buffer.readUInt32LE();
        result.parentBone = buffer.readInt16LE();
        result.subMeshId = buffer.readInt16LE();
        result.boneNameCRC = buffer.readUInt32LE();

        result.translation = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences);
        result.rotation = M2Track.deserialize(buffer, startingOffset, M2CompQuat.deserialize, sequences);
        result.scale = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences);
        result.pivot = C3Vector.deserialize(buffer);
        return result;
    }
}

export class M2Color {
    color: M2Track<C3Vector>;
    /** Fixed16 */
    alpha: M2Track<Fixed16>;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2Color();
        result.color = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences);
        result.alpha = M2Track.deserialize(buffer, startingOffset, deserializeFixed16, sequences);
        return result;
    }
}

export class M2TextureWeight {
    /** Fixed16 */
    weight: M2Track<Fixed16>;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2TextureWeight();
        result.weight = M2Track.deserialize(buffer, startingOffset, deserializeFixed16, sequences);
        return result;
    }
}

export class M2TextureTransform {
    translation: M2Track<C3Vector>;
    rotation: M2Track<C4Quaternion>;
    scaling: M2Track<C3Vector>;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2TextureTransform();
        result.translation = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences);
        result.rotation = M2Track.deserialize(buffer, startingOffset, C4Quaternion.deserialize, sequences);
        result.scaling = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences);
        return result;
    }
}

export class M2Attachment {
    /** uint32_t */
    id: number;
    /** uint16_t */
    bone: number;
    /** uint16_t */
    unknown: number;
    position: C3Vector;
    /** M2Track<uchar> */
    animateAttached: M2Track<number>;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2Attachment();
        result.id = buffer.readUInt32LE();
        result.bone = buffer.readUInt16LE();
        result.unknown = buffer.readUInt16LE();
        result.position = C3Vector.deserialize(buffer);
        result.animateAttached = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readUInt8(), sequences);
        return result;
    }
}

export class M2Light {
    /** uint16_t */
    type: number;
    /** int16_t */
    bone: number;
    position: C3Vector;
    ambientColor: M2Track<C3Vector>;
    /** M2Track<float> */
    ambientIntensity: M2Track<number>;
    diffuseColor: M2Track<C3Vector>;
    /** M2Track<float> */
    diffuseIntensity: M2Track<number>;
    /** M2Track<float> */
    attenuationStart: M2Track<number>;
    /** M2Track<float> */
    attenuationEnd: M2Track<number>;
    /** M2Track<uint8_t> */
    visibility: M2Track<number>;

    static deserialize(buffer: BufferWrapper, startingOffset: number, sequences: M2Sequence[]) {
        const result = new M2Light();
        result.type = buffer.readUInt16LE();
        result.bone = buffer.readInt16LE();
        result.position = C3Vector.deserialize(buffer);
        result.ambientColor = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences)
        result.ambientIntensity = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.diffuseColor = M2Track.deserialize(buffer, startingOffset, C3Vector.deserialize, sequences)
        result.diffuseIntensity = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.attenuationStart = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.attenuationEnd = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readFloatLE(), sequences);
        result.visibility = M2Track.deserialize(buffer, startingOffset, (buff2) => buff2.readUInt8(), sequences);
        return result;
    }
}
