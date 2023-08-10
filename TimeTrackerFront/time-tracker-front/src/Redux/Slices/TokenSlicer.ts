import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session, TimeMark, TimeResponse } from "../Types/Time";
import { itemsInPage } from "../../Components/TimeStatistic";
import { LocationSlicer } from "./LocationSlice";
import { locationOffset } from "./LocationSlice";
import { ChangeLocationPayload, Location, officeTimeZone } from "./LocationSlice";
import { LocationPayload } from "./LocationSlice";
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
        clearErroMassage: (state) => {
            state.error = ""
        },
        setLoginByToken: (state) => {
            state.loginByToken = !state.loginByToken
        },
    }
})

export const {clearErroMassage,setLoginByToken,setErrorStatusAndError,setIdleStatus,setSuccessStatus,setloadingStatus} = TokenSlicer.actions

export default TokenSlicer.reducer;