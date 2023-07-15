import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { Permissions } from "../Types/Permissions";
import { UsersPage } from "../Types/UsersPage";

export interface usersState {
    Users: User[],
    UsersPage: UsersPage
}
const initialState: usersState = {
    Users: [],
    UsersPage: {} as UsersPage
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
        }
    }
});

export const {
    getUsersList,
    getUsersPage
} = userSlice.actions;
export default userSlice.reducer;