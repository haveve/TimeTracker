export interface User {
    id?: number,
    login?: string,
    email?: string,
    password?: string,
    fullName?: string,
    cRUDUsers?: boolean,
    editApprovers?: boolean,
    viewUsers?: boolean,
    editWorkHours?: boolean,
    exportExcel?: boolean,
    controlPresence?: boolean,
    controlDayOffs?: boolean,
    vacationDays?: string,
    daySeconds?: number,
    weekSeconds?: number,
    monthSeconds?: number,
    workHours?: number,
    timeManagedBy?:LasUpdatedBy,
    enabled?: boolean,
    key2Auth?: string|null
}

export enum LasUpdatedBy
{
    None,
    Auto,
    Hand

}