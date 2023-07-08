import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { Permissions } from "../Types/Permissions";


export interface taskState {
    Users: User[],
    Permissions: Permissions[]
}
const initialState: taskState = {
    Users: [],
    Permissions: []
};

export const userSlice = createSlice({
    name: "todolist",
    initialState,
    reducers: {
        getUsersList: (state,
            action: PayloadAction<User[]>) => {
            state.Users = action.payload
        },
        getPermissions: (state,
            action: PayloadAction<Permissions[]>) => {
            state.Permissions = action.payload
        }
    }
});

export const {
    getUsersList,
    getPermissions
} = userSlice.actions;
export default userSlice.reducer;