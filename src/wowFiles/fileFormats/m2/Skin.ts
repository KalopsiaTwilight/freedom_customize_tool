/*!
    Based on code from:

    wow.export (https://github.com/Kruithne/wow.export)
    Authors: Kruithne <kruithne@gmail.com>
    License: MIT
 */

import util from "node:util"
import BufferWrapper from "../../buffer";

const MAGIC_SKIN = 0x4E494B53;

export interface M2SubMesh {
    submeshID: number,
    level: number,
    vertexStart: number,
    vertexCount: number,
    triangleStart: number,
    triangleCount: number,
    boneCount: number,
    boneStart: number,
    boneInfluences: number,
    centerBoneIndex: number,
    centerPosition: [number, number, number],
    sortCenterPosition: [number, number, number],
    sortRadius: number
}

export interface M2TextureUnit {
    flags: number,
    priority: number,
    shaderID: number,
    skinSectionIndex: number,
    flags2: number,
    colorIndex: number,
    materialIndex: number,
    materialLayer: number,
    textureCount: number,
    textureComboIndex: number,
    textureCoordComboIndex: number,
    textureWeightComboIndex: number,
    textureTransformComboIndex: number
}


export default class M2Skin {
    fileDataID: number;
    fileName: string;
    isLoaded: boolean;

    bones: number;
    indices: number[];
    triangles: number[];
    properties: number[];
    subMeshes: M2SubMesh[];
    textureUnits: M2TextureUnit[];

    constructor(fileDataID: number,) {
        this.fileDataID = fileDataID;
        this.isLoaded = false;
    }

    deserialize(data: BufferWrapper) {
        try {
            const magic = data.readUInt32LE();
            if (magic !== MAGIC_SKIN)
                throw new Error('Invalid magic: ' + magic);

            const indicesCount = data.readUInt32LE();
            const indicesOfs = data.readUInt32LE();
            const trianglesCount = data.readUInt32LE();
            const trianglesOfs = data.readUInt32LE();
            const propertiesCount = data.readUInt32LE();
            const propertiesOfs = data.readUInt32LE();
            const subMeshesCount = data.readUInt32LE();
            const subMeshesOfs = data.readUInt32LE();
            const textureUnitsCount = data.readUInt32LE();
            const textureUnitsOfs = data.readUInt32LE();
            this.bones = data.readUInt32LE();

            // Read indices.
            data.seek(indicesOfs);
            this.indices = data.readUInt16LE(indicesCount);

            // Read triangles.
            data.seek(trianglesOfs);
            this.triangles = data.readUInt16LE(trianglesCount);

            // Read properties.
            data.seek(propertiesOfs);
            this.properties = data.readUInt8(propertiesCount);

            // Read subMeshes.
            data.seek(subMeshesOfs);
            this.subMeshes = new Array(subMeshesCount);
            for (let i = 0; i < subMeshesCount; i++) {
                this.subMeshes[i] = {
                    submeshID: data.readUInt16LE(),
                    level: data.readUInt16LE(),
                    vertexStart: data.readUInt16LE(),
                    vertexCount: data.readUInt16LE(),
                    triangleStart: data.readUInt16LE(),
                    triangleCount: data.readUInt16LE(),
                    boneCount: data.readUInt16LE(),
                    boneStart: data.readUInt16LE(),
                    boneInfluences: data.readUInt16LE(),
                    centerBoneIndex: data.readUInt16LE(),
                    centerPosition: [data.readFloatLE(), data.readFloatLE(), data.readFloatLE()],
                    sortCenterPosition: [data.readFloatLE(), data.readFloatLE(), data.readFloatLE()],
                    sortRadius: data.readFloatLE()
                };
            }

            // Read texture units.
            data.seek(textureUnitsOfs);
            this.textureUnits = new Array(textureUnitsCount);
            for (let i = 0; i < textureUnitsCount; i++) {
                this.textureUnits[i] = {
                    flags: data.readUInt8(),
                    priority: data.readInt8(),
                    shaderID: data.readUInt16LE(),
                    skinSectionIndex: data.readUInt16LE(),
                    flags2: data.readUInt16LE(),
                    colorIndex: data.readInt16LE(),
                    materialIndex: data.readUInt16LE(),
                    materialLayer: data.readUInt16LE(),
                    textureCount: data.readUInt16LE(),
                    textureComboIndex: data.readInt16LE(),
                    textureCoordComboIndex: data.readUInt16LE(),
                    textureWeightComboIndex: data.readInt16LE(),
                    textureTransformComboIndex: data.readInt16LE()
                };
            }

            this.isLoaded = true;
        } catch (e) {
            throw new Error(util.format('Unable to load skin fileDataID %d: %s', this.fileDataID, e.message));
        }
    }
}