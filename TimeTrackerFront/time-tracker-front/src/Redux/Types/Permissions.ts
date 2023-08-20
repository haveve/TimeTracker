export interface Permissions {
    userId?: number,
    cRUDUsers: boolean,
    editApprovers: boolean,
    viewUsers: boolean,
    editWorkHours: boolean,
    exportExcel: boolean,
    controlPresence: boolean,
    controlDayOffs: boolean
}