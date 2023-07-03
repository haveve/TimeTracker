import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";


export interface taskState {
    Users: User[],
}
const initialState: taskState = {
    Users: [],
};

export const userSlice = createSlice({
    name: "todolist",
    initialState,
    reducers: {
        getUsersList: (state,
                      action: PayloadAction<User[]>) => {
            state.Users =  action.payload
        }
    }
});

export const {
    getUsersList,
} = userSlice.actions;
export default userSlice.reducer;