export interface User {
    id?: number,
    login?: string,
    password?: string,
    fullName?: string,
    cRUDUsers?: boolean,
    editPermiters?: boolean,
    viewUsers?: boolean,
    editWorkHours?: boolean,
    importExcel?: boolean,
    controlPresence?: boolean,
    controlDayOffs?: boolean
}