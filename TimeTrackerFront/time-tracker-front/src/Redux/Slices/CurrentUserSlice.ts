import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";


export interface currentUserState {
    User: User
}
const initialState: currentUserState = {
    User: {} as User
};

export const userSlice = createSlice({
    name: "currentUser",
    initialState,
    reducers: {
        getTheCurrentUser: (state,
            action: PayloadAction<User>) => {
            state.User = action.payload
        }
    }
});

export const {
    getTheCurrentUser
} = userSlice.actions;
export default userSlice.reducer;