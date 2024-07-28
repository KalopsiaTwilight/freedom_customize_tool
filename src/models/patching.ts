export interface PatchResult {
    resultCode: number,
    message: string
}

export interface Patch {
    Add: AddRecordInstruction[]
    Lookup: LookupRecordInstruction[]
    Update: UpdateRecordInstruction[]
}

export interface AddRecordInstruction {
    Filename: string
    RecordId?: number
    RecordIdReference?: string
    Record: ColumnData[]
    SaveReferences: ReferenceColumnData[]
    GenerateIds: GenerateColumnIdData[]
}

export interface LookupRecordInstruction {
    Filename: string
    Field: string
    SearchValue?: any
    SaveReferences: ReferenceColumnData[]
    IgnoreFailure: boolean
}

export interface UpdateRecordInstruction
{
    Filename: string
    RecordId: number
    Field?: string
    Record: ColumnData[]
}

export interface ReferenceColumnData {
    Name: string
    Field?: string
}

export interface GenerateColumnIdData {
    Name: string
    Field: string
    OverrideExisting: boolean
    FileName?: string
    StartFrom?: number;
}

export interface ColumnData {
    ColumnName: string
    Value?: any
    ReferenceId?: string
    FallBackValue?: any
}