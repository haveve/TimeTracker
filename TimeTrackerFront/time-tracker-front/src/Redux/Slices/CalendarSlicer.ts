import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session, TimeMark, TimeResponse } from "../Types/Time";
import { itemsInPage } from "../../Components/Time/TimeStatistic";
import { LocationSlicer } from "./LocationSlice";
import { ChangeLocationPayload } from "./LocationSlice";
import { LocationPayload } from "./LocationSlice";
import { UpdateTimeReturnType } from "../Requests/TimeRequests";
import { statusType } from "./TimeSlice";
import { GlobalEventsViewModel,CalendarDay } from "../Types/Calendar";

export interface CalendarInitialStateType{
    error?:string,
    status:statusType,
    data:{
        globalCalendar:GlobalEventsViewModel[],
        userCalendar:CalendarDay[]
    }
}

const initialState:CalendarInitialStateType = {
    status : "idle",
    data:{
        globalCalendar:[],
        userCalendar:[]
    }
}


export const CalendarSlicer = createSlice({
    name:"calendar",
    initialState,
    reducers:{
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
        clearErrorMessage: (state) => {
            state.error = ""
        },
        setStartUserCalendar:(state,payload:PayloadAction<CalendarDay[]>)=>{
            state.data.userCalendar = [...payload.payload];
            state.status = "idle";
        },
        setStartGlobalCalendar:(state,payload:PayloadAction<GlobalEventsViewModel[]>)=>{
            state.data.globalCalendar = [...payload.payload];
            state.status = "idle"
        }, 
        setUserCalendar:(state,payload:PayloadAction<CalendarDay[]>)=>{
            state.data.userCalendar = [...payload.payload];
            state.status = "success";
        },
        setGlobalCalendar:(state,payload:PayloadAction<GlobalEventsViewModel[]>)=>{
            state.data.globalCalendar = [...payload.payload];
            state.status = "success"
        }       
    }
})

export default CalendarSlicer.reducer;

export const {setErrorStatusAndError,setGlobalCalendar,setIdleStatus,setUserCalendar,setloadingStatus,clearErrorMessage,setStartUserCalendar,setStartGlobalCalendar}= CalendarSlicer.actions