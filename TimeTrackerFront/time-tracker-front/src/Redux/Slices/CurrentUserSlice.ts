import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { statusType } from "./TimeSlice";
import { Permissions } from "../Types/Permissions";
import { Absence } from "../Types/Absence";

export interface currentUserState {
    User: User,
    Permissions: Permissions
    status:statusType,
    Absences: Absence[],
    error?:string
}
const initialState: currentUserState = {
    User: {} as User,
    Permissions: {} as Permissions,
    Absences: [],
    status:"idle"
};

export const userSlice = createSlice({
    name: "currentUser",
    initialState,
    reducers: {
        getTheCurrentUser: (state,
            action: PayloadAction<User>) => {
            state.User = action.payload
        },
        getCurrentUserAbsencesList: (state,
            action: PayloadAction<Absence[]>) => {
            state.Absences = action.payload
        },
        getTheCurrentPermissions: (state,
            action: PayloadAction<Permissions>) => {
            state.Permissions = action.payload
        },
        setloadingStatus: (state) => {
            state.status = "loading";
        },
        setErrorStatusAndError: (state, action: PayloadAction<string>) => {
            state.status = "error";
            state.error = action.payload;
        },
        setIdleStatus: (state) => {
            state.status = "idle"
            state.error = ""
        },
        clearErroMassage: (state) => {
            state.error = ""
        }
    }
});

export const {
    getTheCurrentUser,
    getTheCurrentPermissions,
    getCurrentUserAbsencesList
} = userSlice.actions;
export default userSlice.reducer;