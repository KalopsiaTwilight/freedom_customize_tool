import { C2Vector, C3Vector, C4Vector } from "../commonTypes";
import { M2Attachment, M2Color, M2CompBone, M2CompQuat, M2Dict, M2ExtendedParticle, M2File, M2Material, M2ParticleEmitter, M2Ribbon, M2Sequence, M2SubMesh, M2Texture, M2TextureTransform, M2TextureUnit, M2TextureWeight, M2Track, M2Vertex, getAnimationName } from "../m2"
import { MO3File } from "./MO3File"
import { MO3Animation, MO3Bone, MO3Color, MO3DictBase, MO3ExtendedParticle, MO3Material, MO3ModelAttachment, MO3ParticleEmitter, MO3RibbonEmitter, MO3SubMesh, MO3Texture, MO3TextureTransform, MO3TextureUnit, MO3TextureWeightsContainer, MO3TrackBase, MO3Vertex } from "./MO3Types";

export class MO3Converter {
    static fromM2(file: M2File) {

        const fallBackSequences = file.sequences.reduce((acc, next) => next.flags & 0x40 ? acc+1 : 0, 0);

        const result = new MO3File();
        result.version = 2002;
        result.m2flags = file.flags;
        result.vertices = file.vertices.map(MO3Converter.M2VertexToMO3);
        result.skinTriangles = file.skins && file.skins[0] ? file.skins[0].triangles : [];
        result.globalLoops = file.globalLoops.map(x => x.timestamp);
        result.animationSequences = file.sequences.map(MO3Converter.M2AnimationToMO3);
        result.animationSequenceLookupTable = file.sequenceLookupTable;
        result.bones = file.bones.map(MO3Converter.M2BoneToMO3);
        result.boneCombos = file.boneCombos;
        result.keyBoneLookup = file.keyBoneLookup;
        result.submeshes = file.skins && file.skins[0] ? file.skins[0].subMeshes.map(MO3Converter.M2SubMeshToMO3) : [];
        result.textureUnits = file.skins && file.skins[0] ? file.skins[0].textureUnits.map(MO3Converter.M2TextureUnitToMO3) : [];
        result.arg11 = [] /* UNKNOWN */
        result.materials = file.materials.map(MO3Converter.M2MaterialToMO3);
        result.textures = file.textures.map(MO3Converter.M2TextureToMO3);
        result.textureCombos = file.textureCombos;
        result.textureTransforms = file.textureTransforms.map(MO3Converter.M2TextureTransformToMO3);
        result.textureTransformCombos = file.textureTransformCombos;
        result.textureIndicesById = file.textureIndicesById;
        result.modelAttachments = file.attachments.map(MO3Converter.M2AttachmentToMO3);
        result.attachmentIndicesById = file.attachmentLookupTable;
        result.colors = file.colors.map(MO3Converter.M2ColorToMO3Color);
        result.textureWeights = file.textureWeights.map(MO3Converter.M2TextureWeightToMO3);
        result.textureWeightComboIndex = file.textureWeightCombos;
        result.particleEmitters = file.particleEmitters.map(MO3Converter.M2ParticleEmitterToMO3);
        result.ribbonEmitters = file.ribbonEmitters.map(MO3Converter.M2RibbonToMO3);
        result.particles = file.particlesExtended.map(MO3Converter.M2ParticleToMO3);
        result.particleEmitterGeosets = file.particleEmitterGeosets.map(x => x.geoset);
        return result;
    }

    private static M2VertexToMO3(vertex: M2Vertex) {
        const result = new MO3Vertex();
        result.pos = MO3Converter.M2Vector3ToMO3(vertex.pos);
        result.normal = [vertex.normal.x, vertex.normal.y, vertex.normal.z, 0];
        result.texCoords1_x = vertex.texCoords[0].x;
        result.texCoords1_y = vertex.texCoords[0].y;
        result.texCoords2_x = vertex.texCoords[1].x;
        result.texCoords2_y = vertex.texCoords[1].y;
        result.boneWeights = vertex.boneWeights;
        result.boneIndices = vertex.boneIndices;
        return result;
    }

    private static M2AnimationToMO3(animation: M2Sequence) {
        const result = new MO3Animation();
        result.id = animation.id;
        result.variationIndex = animation.variationIndex;
        result.duration = animation.duration;
        result.flags = animation.flags;
        result.frequency = animation.frequency;
        result.blendTimeIn = animation.blendTimeIn;
        result.blendTimeOut = animation.blendTimeOut;
        result.extentMin = MO3Converter.M2Vector3ToMO3(animation.bounds.extent.min);
        result.extentMax = MO3Converter.M2Vector3ToMO3(animation.bounds.extent.max);
        result.variationNext = animation.variationNext;
        result.aliasNext = animation.aliasNext;
        result.animationName = getAnimationName(animation.id);
        return result;
    }

    private static M2BoneToMO3(bone: M2CompBone, index: number) {
        const result = new MO3Bone();
        result.index = index;
        result.keyBoneId = bone.keyBoneId;
        result.flags = bone.flags;
        result.parentBoneId = bone.parentBone;
        result.subMeshId = bone.subMeshId;
        result.boneNameCRC = bone.boneNameCRC;
        result.pivot = MO3Converter.M2Vector3ToMO3(bone.pivot);
        result.translation = MO3Converter.M2TrackToMO3Array(bone.translation, MO3Converter.M2Vector3ToMO3);
        result.rotation = MO3Converter.M2TrackToMO3Array(bone.rotation, MO3Converter.M2CompquatToMO3);
        result.scale = MO3Converter.M2TrackToMO3Array(bone.scale, MO3Converter.M2Vector3ToMO3);
        return result;
    }

    private static M2SubMeshToMO3(subMesh: M2SubMesh) {
        const result = new MO3SubMesh();
        result.submeshID = subMesh.submeshID;
        result.level = subMesh.level;
        result.vertexStart = subMesh.vertexStart;
        result.vertexCount = subMesh.vertexCount;
        result.triangleStart = subMesh.triangleStart;
        result.triangleCount = subMesh.triangleCount;
        result.centerBoneIndex = subMesh.centerBoneIndex;
        result.centerPosition = subMesh.centerPosition;
        result.sortCenterPosition = subMesh.sortCenterPosition;
        result.sortRadius = subMesh.sortRadius;
        return result;
    }

    private static M2TextureUnitToMO3(unit: M2TextureUnit) {
        const result = new MO3TextureUnit();
        result.flags = unit.flags;
        result.priority = unit.priority;
        result.shaderId = unit.shaderID;
        result.skinSectionIndex = unit.skinSectionIndex;
        result.flags2 = unit.flags2;
        result.colorIndex = unit.colorIndex;
        result.materialIndex = unit.materialIndex;
        result.materialLayer = unit.materialLayer;
        result.textureCount = unit.textureCount;
        result.textureComboIndex = unit.textureComboIndex;
        result.textureCoordComboIndex = unit.textureCoordComboIndex;
        result.textureWeightComboIndex = unit.textureWeightComboIndex;
        result.textureTransformComboIndex = unit.textureTransformComboIndex;
        return result;
    }

    private static M2MaterialToMO3(material: M2Material) {
        const result = new MO3Material();
        result.flags = material.flags;
        result.blendingMode = material.blendingMode;
        return result;
    }

    private static M2TextureToMO3(texture: M2Texture, index: number) {
        const result = new MO3Texture();
        result.index = index;
        result.type = texture.type;
        result.flags = texture.flags;
        result.textureId = texture.fileId;
        return result;
    }

    private static M2TextureTransformToMO3(transform: M2TextureTransform) {
        const result = new MO3TextureTransform();
        result.translation = MO3Converter.M2TrackToMO3Array(transform.translation, MO3Converter.M2Vector3ToMO3);
        result.rotation = MO3Converter.M2TrackToMO3Array(transform.rotation, MO3Converter.M2Vector4ToMO3);
        result.scaling = MO3Converter.M2TrackToMO3Array(transform.scaling, MO3Converter.M2Vector3ToMO3);
        return result;
    }

    private static M2AttachmentToMO3(attachment: M2Attachment) {
        const result = new MO3ModelAttachment();
        result.id = attachment.id;
        result.bone = attachment.bone;
        result.position = MO3Converter.M2Vector3ToMO3(attachment.position);
        return result;
    }

    private static M2TextureWeightToMO3(weight: M2TextureWeight) {
        const result = new MO3TextureWeightsContainer();;
        result.weight = MO3Converter.M2TrackToMO3Array(weight.weight, (x) => x.raw);
        return result;
    }

    private static M2ParticleEmitterToMO3(system: M2ParticleEmitter) {
        const result = new MO3ParticleEmitter();
        result.particleId = system.particleId;
        result.flags = system.flags;
        result.position = MO3Converter.M2Vector3ToMO3(system.position);
        result.bone = system.bone;
        result.texture = system.texture;
        result.blendingType = system.blendingType;
        result.emitterType = system.emitterType;
        result.particleColorIndex = system.particleColorIndex;
        result.textureTileRotation = system.textureTileRotation;
        result.textureDimensionRows = system.textureDimensionsRows;
        result.textureDimensionColumns = system.textureDimensionsColumns;
        result.emissionSpeed = MO3Converter.M2TrackToMO3Array(system.emissionSpeed);
        result.speedVariation = MO3Converter.M2TrackToMO3Array(system.speedVariation);
        result.verticalRange = MO3Converter.M2TrackToMO3Array(system.verticalRange);
        result.horizontalRange = MO3Converter.M2TrackToMO3Array(system.horizontalRange);
        result.gravity = MO3Converter.M2TrackToMO3Array(system.gravity, MO3Converter.M2Vector3ToMO3);
        result.lifespan = MO3Converter.M2TrackToMO3Array(system.lifespan);
        result.lifespanVary = system.lifespanVary;
        result.emissionRate = MO3Converter.M2TrackToMO3Array(system.emissionRate);
        result.emissionRateVary = system.emissionRateVary;
        result.emissionAreaLength = MO3Converter.M2TrackToMO3Array(system.emissionAreaLength);
        result.emissionAreaWidth = MO3Converter.M2TrackToMO3Array(system.emissionAreaWidth);
        result.zSource = MO3Converter.M2TrackToMO3Array(system.zSource);
        result.colorTrack = MO3Converter.M2DictToMO3(system.colorTrack, MO3Converter.M2Vector3ToMO3);
        result.alphaTrack = MO3Converter.M2DictToMO3(system.alphaTrack, (x) => x.raw);
        result.scaleTrack = MO3Converter.M2DictToMO3(system.scaleTrack, MO3Converter.M2Vector2ToMO3);
        result.scaleVary = MO3Converter.M2Vector2ToMO3(system.scaleVary);
        result.headCellTrack = MO3Converter.M2DictToMO3(system.headCellTrack);
        result.tailCellTrack = MO3Converter.M2DictToMO3(system.tailCellTrack);
        result.tailLength = system.tailLength;
        result.twinkleSpeed = system.twinkleSpeed;
        result.twinklePercent = system.twinklePercent;
        result.twinkleScale = [system.twinkleScale.min, system.twinkleScale.max];
        result.burstMultiplier = system.burstMultiplier;
        result.drag = system.drag;
        result.baseSpin = system.baseSpin;
        result.baseSpinVary = system.baseSpinVary;
        result.spin = system.spin;
        result.spinVary = system.spinVary;
        result.tumbleModelRationSpeedMin = MO3Converter.M2Vector3ToMO3(system.tumble.modelRotationSpeedMin);
        result.tumbleModelRotationSpeedMax = MO3Converter.M2Vector3ToMO3(system.tumble.modelRotationSpeedMax);
        result.windVector = MO3Converter.M2Vector3ToMO3(system.windVector);
        result.windTime = system.windTime;
        result.followSpeed1 = system.followSpeed1;
        result.followScale1 = system.followScale1;
        result.followSpeed2 = system.followSpeed2;
        result.followScale2 = system.followScale2;
        result.splinePoints = system.splinePoints.map(MO3Converter.M2Vector3ToMO3);
        result.enabledIn = MO3Converter.M2TrackToMO3Array(system.enabledIn);
        result.multiTextureParamX = [system.multiTextureParamX[0].float, system.multiTextureParamX[1].float];
        result.multiTextureParam0 = [
            [system.multiTextureParam0[0].x.float, system.multiTextureParam0[0].y.float],
            [system.multiTextureParam0[1].x.float, system.multiTextureParam0[1].y.float],
        ]
        result.multiTextureParam1 = [
            [system.multiTextureParam1[0].x.float, system.multiTextureParam1[0].y.float],
            [system.multiTextureParam1[1].x.float, system.multiTextureParam1[1].y.float],
        ]
        return result;
    }

    private static M2ColorToMO3Color(color: M2Color) {
        const result = new MO3Color();
        result.color = MO3Converter.M2TrackToMO3Array(color.color, MO3Converter.M2Vector3ToMO3);
        result.alpha = MO3Converter.M2TrackToMO3Array(color.alpha, (x) => x.raw);
        return result;
    }

    private static M2ParticleToMO3(particle: M2ExtendedParticle) {
        const result = new MO3ExtendedParticle();
        result.zSource = particle.zSource;
        result.colorMult = particle.colorMult;
        result.alphaMult = particle.alphaMult;
        result.alphaCutoff = MO3Converter.M2DictToMO3(particle.alphaCutoff, (x) => x.raw);
        return result;
    }

    private static M2RibbonToMO3(ribbon: M2Ribbon) {
        const result = new MO3RibbonEmitter();
        result.ribbonId = ribbon.ribbonId;
        result.boneIndex = ribbon.boneIndex;
        result.position = MO3Converter.M2Vector3ToMO3(ribbon.position);
        result.textureIndices = ribbon.textureIndices;
        result.materialIndices = ribbon.materialIndices;
        result.colorTrack = MO3Converter.M2TrackToMO3Array(ribbon.colorTrack, MO3Converter.M2Vector3ToMO3);
        result.alphaTrack = MO3Converter.M2TrackToMO3Array(ribbon.alphaTrack, (x) => x.raw);
        result.heightAboveTrack = MO3Converter.M2TrackToMO3Array(ribbon.heightAboveTrack);
        result.heightBelowTrack = MO3Converter.M2TrackToMO3Array(ribbon.heightBelowTrack);
        result.edgesPerSecond = ribbon.edgesPerSecond;
        result.edgeLifetime = ribbon.edgeLifetime;
        result.gravity = ribbon.gravity;
        result.textureRows = ribbon.textureRows;
        result.textureCols = ribbon.textureCols;
        result.texSlotTrack = MO3Converter.M2TrackToMO3Array(ribbon.texSlotTrack);
        result.visibilityTrack = MO3Converter.M2TrackToMO3Array(ribbon.visibilityTrack);
        result.priorityPlane = ribbon.priorityPlane;
        return result;
    }
    
    private static M2TrackToMO3Array<X>(track: M2Track<X>): MO3TrackBase<X>[]
    private static M2TrackToMO3Array<X,Y>(track: M2Track<X>, convertFn: (arg: X) => Y): MO3TrackBase<Y>[]
    private static M2TrackToMO3Array<X,Y=X>(track: M2Track<X>, convertFn?: (arg: X) => Y): MO3TrackBase<X|Y>[] {
        return track.timestamps.map(
            (x, i) => {
                const result = new MO3TrackBase<X|Y>();
                result.interpolationType = track.interpolationType;
                result.globalSequence = track.globalSequence;
                result.hasTimeStamps = x.length > 0;
                result.timestamps = x;

                let values = track.values[i]

                if (values.length === 0) {
                    values = track.values[0]
                }
                const maxLength = x.length > 0 ? x.length : 1;
                if (convertFn) {
                    result.values = values.map(convertFn) //.filter((_, i) => i < maxLength);
                } else {
                    result.values = values //.filter((_, i) => i < maxLength);
                }
                return result;
            }
        )
    }

    private static M2DictToMO3<X>(dict: M2Dict<X>): MO3DictBase<X>
    private static M2DictToMO3<X,Y>(dict: M2Dict<X>, convertFn?: (arg: X) => Y): MO3DictBase<Y>
    private static M2DictToMO3<X,Y=X>(dict: M2Dict<X>, convertFn?: (arg: X) => Y): MO3DictBase<X|Y> {
        const result = new MO3DictBase<X|Y>();
        result.keys = dict.keys;
        if (convertFn) {
            result.values = dict.values.map(convertFn);
        } else {
            result.values = dict.values;
        }
        return result;
    }

    private static M2Vector2ToMO3(vector: C2Vector): [number, number] {
        return [vector.x, vector.y]
    }
    private static M2Vector3ToMO3(vector: C3Vector): [number, number, number] {
        return [vector.x, vector.y, vector.z]
    }
    private static M2Vector4ToMO3(vector: C4Vector): [number, number, number, number] {
        return [vector.x, vector.y, vector.z, vector.w]
    }
    private static M2CompquatToMO3(compquat: M2CompQuat): [number, number, number, number]
    {
        return [
            (compquat.x <= 0 ? compquat.x + 32768 : compquat.x-32767)/32767.0,
            (compquat.y <= 0 ? compquat.y + 32768 : compquat.y-32767)/32767.0,
            (compquat.z <= 0 ? compquat.z + 32768 : compquat.z-32767)/32767.0,
            (compquat.w <= 0 ? compquat.w + 32768 : compquat.w-32767)/32767.0,
        ]
    }
}

