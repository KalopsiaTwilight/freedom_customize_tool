import BufferWrapper from "../buffer";

export class C2Vector {
    /** float */
    x: number; 
    /** float */
    y: number;

    constructor() {
        this.x = 0;
        this.y = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C2Vector();
        result.x = buffer.readFloatLE();
        result.y = buffer.readFloatLE();
        return result;
    }
}

export class C2iVector {
    /** int */
    x: number; 
    /** int */
    y: number;

    constructor() {
        this.x = 0;
        this.y = 0;
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new C2iVector();
        result.x = buffer.readInt32LE();
        result.y = buffer.readInt32LE();
        return result;
    }
}

export class C3Vector extends C2Vector {
    /** float */
    z: number;

    constructor() {
        super();
        this.z = 0;
    }

    scale(scalar: number) {
        const result = new C3Vector();
        result.x = this.x * scalar;
        result.y = this.y * scalar;
        result.z = this.z * scalar;
        return result;
    }

    dot(other: C3Vector) {
        let result = 0;
        result += this.x * other.x;
        result += this.y * other.y;
        result += this.z * other.z;
        return result;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C3Vector();
        result.x = buffer.readFloatLE();
        result.y = buffer.readFloatLE();
        result.z = buffer.readFloatLE();
        return result;
    }
}

export class C3iVector extends C2iVector {
    /** int */
    z: number;

    constructor() {
        super();
        this.z = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C3iVector();
        result.x = buffer.readInt32LE();
        result.y = buffer.readInt32LE();
        result.z = buffer.readInt32LE();
        return result;
    }
}

export class C4Vector extends C3Vector {
    /** float */
    w: number;

    constructor() {
        super();
        this.w = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C4Vector();
        result.x = buffer.readFloatLE();
        result.y = buffer.readFloatLE();
        result.z = buffer.readFloatLE();
        result.w = buffer.readFloatLE();
        return result;
    }
}

export class C4iVector extends C3iVector {
    /** int */
    w: number;

    constructor() {
        super();
        this.w = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C4iVector();
        result.x = buffer.readInt32LE();
        result.y = buffer.readInt32LE();
        result.z = buffer.readInt32LE();
        result.w = buffer.readInt32LE();
        return result;
    }
}

export class C33Matrix {
    columns: [C3Vector, C3Vector, C3Vector];
    
    constructor() {
        this.columns = [new C3Vector(), new C3Vector(), new C3Vector()]
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C33Matrix();
        result.columns = [
            C3Vector.deserialize(buffer),
            C3Vector.deserialize(buffer),
            C3Vector.deserialize(buffer)
        ]
        return result;
    }
}

export class C34Matrix {
    columns: [C3Vector, C3Vector, C3Vector, C3Vector];

    constructor() {
        this.columns = [new C3Vector(), new C3Vector(), new C3Vector(), new C3Vector()]
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C34Matrix();
        result.columns = [
            C3Vector.deserialize(buffer),
            C3Vector.deserialize(buffer),
            C3Vector.deserialize(buffer),
            C3Vector.deserialize(buffer)
        ]
        return result;
    }
}

export class C44Matrix {
    columns: [C4Vector, C4Vector, C4Vector, C4Vector];

    constructor() {
        this.columns = [new C4Vector(), new C4Vector(), new C4Vector(), new C4Vector()]
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C44Matrix();
        result.columns = [
            C4Vector.deserialize(buffer),
            C4Vector.deserialize(buffer),
            C4Vector.deserialize(buffer),
            C4Vector.deserialize(buffer)
        ]
        return result;
    }
}

export class C4Plane
{
    normal: C3Vector;
    /** float */
    distance: number;

    constructor() {
        this.normal = new C3Vector();
        this.distance = 0;
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new C4Plane();
        result.normal = C3Vector.deserialize(buffer);
        result.distance = buffer.readFloatLE();
        return result;
    }
}

export class C4Quaternion {
    /** float */
    x: number;
    /** float */
    y: number;
    /** float */
    z: number;
    /** float */
    w: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new C4Quaternion();
        result.x = buffer.readFloatLE();
        result.y = buffer.readFloatLE();
        result.z = buffer.readFloatLE();
        result.w = buffer.readFloatLE();
        return result;
    }
}

export class CRange {
    /** float */
    min: number;
    /** float */
    max: number;

    constructor() {
        this.max = 0;
        this.min = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new CRange();
        result.min = buffer.readFloatLE();
        result.max = buffer.readFloatLE();
        return result;
    }
}

export class CAxisAlignedBox {
    min: C3Vector;
    max: C3Vector;
    
    constructor() {
        this.min = new C3Vector();
        this.max = new C3Vector();
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new CAxisAlignedBox();
        result.min = C3Vector.deserialize(buffer);
        result.max = C3Vector.deserialize(buffer);
        return result;
    }
}

export class CAxisAlignedSphere {
    /** float */
    position: C3Vector;
    /** float */
    radius: number;
    
    constructor() {
        this.position = new C3Vector();
        this.radius = 0;
    }

    static deserialize(buffer: BufferWrapper) {
        const result = new CAxisAlignedSphere();
        result.position = C3Vector.deserialize(buffer);
        result.radius = buffer.readFloatLE();
        return result;
    }
}

export class CArgb {
    /** char */
    r: number;
    /** char */
    g: number;
    /** char */
    b: number;
    /** char */
    a: number;

    constructor() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 255;
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new CArgb();
        result.r = buffer.readUInt8();
        result.g = buffer.readUInt8();
        result.b = buffer.readUInt8();
        result.a = buffer.readUInt8();
        return result;
    }
}

export class CImVector {
    /** char */
    b: number;
    /** char */
    g: number;
    /** char */
    r: number;
    /** char */
    a: number;

    constructor() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 255;
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new CImVector();
        result.b = buffer.readUInt8();
        result.g = buffer.readUInt8();
        result.r = buffer.readUInt8();
        result.a = buffer.readUInt8();
        return result;
    }
}

export class C3sVector {
    /** int16_t */
    x: number;
    /** int16_t */
    y: number;
    /** int16_t */
    z: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new C3sVector();
        result.x = buffer.readInt16LE();
        result.y = buffer.readInt16LE();
        result.z = buffer.readInt16LE();
        return result;
    }
}

export class C3Segment 
{
    start: C3Vector;
    end: C3Vector;

    constructor() {
        this.start = new C3Vector();
        this.end = new C3Vector();
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new C3Segment();
        result.start = C3Vector.deserialize(buffer);
        result.end = C3Vector.deserialize(buffer);
        return result;
    }
}

export class CFacet
{
    plane: C4Plane;
    vertices: [C3Vector, C3Vector, C3Vector];

    constructor() {
        this.plane = new C4Plane();
        this.vertices = [new C3Vector(),new C3Vector(),new C3Vector()]
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new CFacet();
        result.plane = C4Plane.deserialize(buffer);
        result.vertices = [C3Vector.deserialize(buffer),C3Vector.deserialize(buffer),C3Vector.deserialize(buffer)];
        return result;
    }
}

export class C3Ray
{
    origin: C3Vector;
    dir: C3Vector;

    constructor() {
        this.origin = new C3Vector();
        this.dir = new C3Vector();
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new C3Ray();
        result.origin = C3Vector.deserialize(buffer);
        result.dir = C3Vector.deserialize(buffer);
        return result;
    }
}

export class CRect {
    /** float */
    miny: number;
    /** float */
    minx: number;
    /** float */
    maxy: number;
    /** float */
    maxx: number;

    constructor() {
        this.miny = 0;
        this.minx = 0;
        this.maxy = 0;
        this.maxx = 0;
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new CRect();
        result.miny = buffer.readFloatLE();
        result.minx = buffer.readFloatLE();
        result.maxy = buffer.readFloatLE();
        result.maxx = buffer.readFloatLE();
        return result;
    }
}

export class CiRect {
    /** int */
    miny: number;
    /** int */
    minx: number;
    /** int */
    maxy: number;
    /** int */
    maxx: number;

    constructor() {
        this.miny = 0;
        this.minx = 0;
        this.maxy = 0;
        this.maxx = 0;
    }
    
    static deserialize(buffer: BufferWrapper) {
        const result = new CiRect();
        result.miny = buffer.readInt32LE();
        result.minx = buffer.readInt32LE();
        result.maxy = buffer.readInt32LE();
        result.maxx = buffer.readInt32LE();
        return result;
    }
}

export class Fixed_Point<IntegerBits extends number, DecimalBits extends number> 
{
    integerBits: number;
    decimalBits: number;
    raw: number;

    constructor(raw: number, integerBits: number, decimalBits: number) {
        this.raw = raw;
        this.integerBits = integerBits;
        this.decimalBits = decimalBits;
    }

    get integerAndDecimalBits() {
        return ((1 << this.integerBits + this.decimalBits)-1) & this.raw;
    }

    get factor() {
        return this.integerBits 
            ? ( 1 << this.decimalBits)
            : (1  << (this.decimalBits + 1)) -1
    } 

    get sign(): boolean {
        return ((1 << (this.integerBits + this.decimalBits) & this.raw)) > 0;
    }

    get float(): number {
        return (this.sign ? -1 : 1) * this.integerAndDecimalBits / this.factor; 
    }

    toJSON() {
        return this.raw;
    }
}

/** Divide by 0x7fff*/
export type Fixed16 = Fixed_Point<0, 15>
export function deserializeFixed16(buffer: BufferWrapper): Fixed16 {
    return new Fixed_Point<0, 15>(buffer.readUInt16LE(), 0, 15);
} 