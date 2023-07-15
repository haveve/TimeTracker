import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../Types/User";
import { statusType } from "./TimeSlice";

export interface currentUserState {
    User: User,
    status:statusType,
    error?:string
}
const initialState: currentUserState = {
    User: {} as User,
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
    getTheCurrentUser
} = userSlice.actions;
export default userSlice.reducer;