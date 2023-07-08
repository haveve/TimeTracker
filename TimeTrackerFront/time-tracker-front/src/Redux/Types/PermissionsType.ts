export interface PermissionsType {
    id: number,
    cRUDUsers: boolean,
    editPermiters: boolean,
    viewUsers: boolean,
    editWorkHours: boolean,
    importExcel: boolean,
    controlPresence: boolean,
    controlDayOffs: boolean
}