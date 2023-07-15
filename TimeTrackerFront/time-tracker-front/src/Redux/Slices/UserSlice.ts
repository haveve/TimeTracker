import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { UsersPage } from "../Types/UsersPage";
import { TimeRequest } from "../Types/Time";
import { statusType } from "./TimeSlice";

export interface usersState {
    Users: User[],
    UsersPage: UsersPage,
    status:statusType,
    error?:string
}
const initialState: usersState = {
    Users: [],
    UsersPage: {} as UsersPage,
    status: "idle"
};

export const userSlice = createSlice({
    name: "userList",
    initialState,
    reducers: {
        getUsersList: (state,
            action: PayloadAction<User[]>) => {
            state.Users = action.payload
        },
        getUsersPage: (state,
            action: PayloadAction<UsersPage>) => {
            state.UsersPage = action.payload
        },
        updateUserTime:(state,action:PayloadAction<TimeRequest>)=>{
            const u = state.Users.filter(u=>u.id == action.payload.id)[0];
                u.daySeconds = action.payload.time.daySeconds;
                u.weekSeconds = action.payload.time.weekSeconds;
                u.monthSeconds = action.payload.time.monthSeconds;
                state.status = "success"
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
    getUsersList,
    getUsersPage,
    updateUserTime,
    setloadingStatus,
    setErrorStatusAndError,
    setIdleStatus,
    clearErroMassage
} = userSlice.actions;
export default userSlice.reducer;