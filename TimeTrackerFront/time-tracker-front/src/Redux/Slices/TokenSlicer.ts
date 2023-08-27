import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { statusType } from "./TimeSlice";

type initialStateType = {
    status:statusType,
    loginByToken:boolean,
    error?:string
}

let initialState:initialStateType = {
    status:"loading",
    loginByToken:false
}

export const TokenSlicer = createSlice({
    name : "token",
    initialState,
    reducers:{
        setSuccessStatus: (state) => {
            state.status = "success";
            state.error = ""
        },
        setloadingStatus: (state) => {
            state.status = "loading";
            state.error = ""
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
        },
        setLoginByToken: (state,action:PayloadAction<boolean>) => {
            state.loginByToken = action.payload
        },
    }
})

export const {
    clearErrorMessage,
    setLoginByToken,
    setErrorStatusAndError,
    setIdleStatus,
    setSuccessStatus,
    setloadingStatus} = TokenSlicer.actions

export default TokenSlicer.reducer;