import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {TimeMark, TimeResponse } from "../Types/Time";
import { itemsInPage } from "../../Components/TimeStatistic";

export type statusType = "idle" | "error" | "success" | "loading";

export type stateTimeType = {
    time: TimeResponse,
    error?: string,
    status: statusType
}

const time: TimeResponse = {
    itemsCount:0,
    time: {
        daySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
        sessions:[]
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
        setStartTime:(state,action:PayloadAction<Date>)=>{

            if(state.time.time.sessions.length == itemsInPage)
            state.time.time.sessions.pop()

            state.time.time.sessions.unshift({startTimeTrackDate: action.payload,
                                              endTimeTrackDate:null,
                                              timeMark: TimeMark.Day})
        },
        setEndTime:(state,action:PayloadAction<Date>)=>{
            state.time.time.sessions[0].endTimeTrackDate = action.payload
            const differenceInSeconds = Math.floor((state.time.time.sessions[0].endTimeTrackDate.getTime() - state.time.time.sessions[0].startTimeTrackDate.getTime())/1000)
            state.time.time.daySeconds += differenceInSeconds;
            state.time.time.weekSeconds += differenceInSeconds;
            state.time.time.monthSeconds += differenceInSeconds;
        },
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
export const {setTime,setEndTime,setStartTime, setloadingStatus,changeTimerState, setErrorStatusAndError, setIdleStatus, clearErroMassage } = timeSlicer.actions;
export default timeSlicer.reducer;