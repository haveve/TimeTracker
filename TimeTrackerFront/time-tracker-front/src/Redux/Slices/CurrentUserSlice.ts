import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { statusType } from "./TimeSlice";
import { Permissions } from "../Types/Permissions";

export interface currentUserState {
    User: User,
    Permissions: Permissions
    status:statusType,
    error?:string
}
const initialState: currentUserState = {
    User: {} as User,
    Permissions: {} as Permissions,
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
    getTheCurrentPermissions
} = userSlice.actions;
export default userSlice.reducer;