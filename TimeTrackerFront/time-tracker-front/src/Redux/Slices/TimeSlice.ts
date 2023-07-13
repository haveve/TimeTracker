import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Time } from "../Types/Time";

export type statusType = "idle"|"error"|"success"|"loading";

export type stateTimeType = {
    time:Time,
    error?:string,
    status:statusType
}

const time:Time = {
    daySeconds: 0,
    weekSeconds: 0,
    monthSeconds: 0 
}

const initialState:stateTimeType = {
    time,
    status:"idle"
}

export const timeSlicer = createSlice({
    name:"time",
    initialState,
    reducers:{
        plusOneSecond:(state)=>{
            state.time.daySeconds++;
            state.time.monthSeconds++;
            state.time.weekSeconds++;
            state.status = "success"
        },
        setTime:(state,action:PayloadAction<Time>)=>{
            state.time = action.payload;
            state.status = "success"
            state.error = ""
        },
        setloadingStatus:(state)=>{
            state.status = "loading";
        },
        setErrorStatusAndError:(state,action:PayloadAction<string>)=>{
            state.status = "error";
            state.error = action.payload;
        },
        setIdleStatus:(state)=>{
            state.status = "idle"
            state.error = ""
        },
        clearErroMassage:(state)=>{
            state.error = ""
        }
    },
})

export const timeSlicerAction = timeSlicer.actions;
export const {plusOneSecond,setTime,setloadingStatus,setErrorStatusAndError,setIdleStatus,clearErroMassage} = timeSlicer.actions;
export default timeSlicer.reducer;