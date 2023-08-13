export interface Permissions {
    userId?: number,
    cRUDUsers: boolean,
    editPermiters: boolean,
    viewUsers: boolean,
    editWorkHours: boolean,
    importExcel: boolean,
    controlPresence: boolean,
    controlDayOffs: boolean
}