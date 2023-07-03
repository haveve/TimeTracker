export interface User {
    id: number,
    login: string,
    password: string,
    fullName: string,
    CRUDUsers: boolean,
    EditPermiters: boolean,
    ViewUsers: boolean,
    EditWorkHours: boolean,
    ImportExcel: boolean,
    ControlPresence: boolean,
    ControlDayOffs: boolean
}