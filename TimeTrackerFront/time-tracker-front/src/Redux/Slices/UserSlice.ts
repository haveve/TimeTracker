import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { Permissions } from "../Types/Permissions";


export interface usersState {
    Users: User[]
}
const initialState: usersState = {
    Users: []
};

export const userSlice = createSlice({
    name: "userList",
    initialState,
    reducers: {
        getUsersList: (state,
            action: PayloadAction<User[]>) => {
            state.Users = action.payload
        }
    }
});

export const {
    getUsersList
} = userSlice.actions;
export default userSlice.reducer;