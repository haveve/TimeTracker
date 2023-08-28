import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { UsersPage } from "../Types/UsersPage";
import { statusType } from "./TimeSlice";

export interface usersState {
    Users: User[],
    UsersBySearch: User[]
    UsersPage: UsersPage,
    status: statusType,
    error?: string,
    isLogin: boolean,
}
const initialState: usersState = {
    Users: [],
    UsersBySearch: [],
    UsersPage: {} as UsersPage,
    status: "idle",
    isLogin: false,
};

export const userSlice = createSlice({
    name: "userList",
    initialState,
    reducers: {
        getUsersList: (state,
            action: PayloadAction<User[]>) => {
            state.Users = action.payload
        },
        getUsersListBySearch: (state,
            action: PayloadAction<User[]>) => {
            state.UsersBySearch = action.payload
        },
        getUsersPage: (state,
            action: PayloadAction<UsersPage>) => {
            state.UsersPage = action.payload
            state.isLogin = true;
        },
        setLogout: (state) => {
            state.isLogin = false;
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
        clearErrorMessage: (state) => {
            state.error = ""
        }
    }
});

export const {
    getUsersList,
    getUsersListBySearch,
    getUsersPage,
    setloadingStatus,
    setErrorStatusAndError,
    setIdleStatus,
    clearErrorMessage,
    setLogout
} = userSlice.actions;
export default userSlice.reducer;