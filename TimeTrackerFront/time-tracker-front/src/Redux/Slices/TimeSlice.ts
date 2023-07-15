import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {TimeResponse } from "../Types/Time";

export type statusType = "idle" | "error" | "success" | "loading";

export type stateTimeType = {
    time: TimeResponse,
    error?: string,
    status: statusType
}

const time: TimeResponse = {
    time: {
        daySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0
    },
    isStarted: false
}

const initialState: stateTimeType = {
    time,
    status: "idle"
}

export const timeSlicer = createSlice({
    name: "time",
    initialState,
    reducers: {
        setTime: (state, action: PayloadAction<TimeResponse>) => {
            state.time = action.payload;
            state.status = "success"
            state.error = ""
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
        },
        changeTimerState: (state)=>{
            state.time.isStarted = !state.time.isStarted;
        }
    },
})

export const timeSlicerAction = timeSlicer.actions;
export const {setTime, setloadingStatus,changeTimerState, setErrorStatusAndError, setIdleStatus, clearErroMassage } = timeSlicer.actions;
export default timeSlicer.reducer;