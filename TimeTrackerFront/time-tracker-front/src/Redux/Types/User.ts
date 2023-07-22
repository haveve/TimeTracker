export interface User {
    id?: number,
    login?: string,
    email?: string,
    password?: string,
    fullName?: string,
    cRUDUsers?: boolean,
    editPermiters?: boolean,
    viewUsers?: boolean,
    editWorkHours?: boolean,
    importExcel?: boolean,
    controlPresence?: boolean,
    controlDayOffs?: boolean,
    daySeconds?:number,
    weekSeconds?:number,
    monthSeconds?:number
    timeManagedBy?:LasUpdatedBy
}

export enum LasUpdatedBy
{
    None,
    Auto,
    Hand
}