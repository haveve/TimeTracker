import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";
import { statusType } from "./TimeSlice";

export const officeTimeZone = [
    // January - Eastern European Time (EET) - UTC+2:00
    2,
    // February - Eastern European Time (EET) - UTC+2:00
    2,
    // March - Eastern European Time (EET) - UTC+2:00
    2,
    // April - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // May - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // June - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // July - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // August - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // September - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // October - Eastern European Time (EET) - UTC+2:00
    2,
    // November - Eastern European Time (EET) - UTC+2:00
    2,
    // December - Eastern European Time (EET) - UTC+2:00
    2
];
export const locationOffset = moment().utcOffset();

export interface TimeZone{
    name:string,
    value:number
}

export interface LocationPayload{
    timeZone:TimeZone,
    userOffset:number,
    oldOffset:number,
}

export interface Location{
    userOffset:number
    listOfTimeZones:TimeZone[],
    status: statusType,
    error?:string
}

const initialState:Location = {
    userOffset:officeTimeZone[new Date().getMonth()] * 60,
    listOfTimeZones:[{ name: "Office(Kyiv)", value: officeTimeZone[new Date().getMonth()] * 60 }],
    status:"idle"
}

export interface ChangeLocationPayload{
    oldOffSet:number,
    newOffSet:number
}

export const LocationSlicer = createSlice({
    name: "location",
    initialState,
    reducers:{
        setLocation:(state,action:PayloadAction<LocationPayload>)=>{
            state.userOffset = action.payload.userOffset
            state.listOfTimeZones = [...state.listOfTimeZones,action.payload.timeZone]
            state.status = "success"
        },
        changeLocation:(state,action:PayloadAction<ChangeLocationPayload>)=>{
            state.userOffset = action.payload.newOffSet
            state.status = "success"
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
        
    }

})

export const {setLocation,setErrorStatusAndError,setloadingStatus,setIdleStatus,clearErroMassage,changeLocation} = LocationSlicer.actions;
export default LocationSlicer.reducer;