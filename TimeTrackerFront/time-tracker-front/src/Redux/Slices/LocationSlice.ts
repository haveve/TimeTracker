import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import moment from "moment";
import { statusType } from "./TimeSlice";

export const officeCountry = "Ukraine";

export function convertStartOfWeekToEnum(sOfw:string){
    switch(sOfw){
        case "Monday":return startOfWeek.Monday; 
        case "Saturday":return startOfWeek.Saturday;
        case "Sunday":return startOfWeek.Sunday;
    }
    throw "Uncorrect start of week";
}

export enum startOfWeek {
    Sunday = "SUNDAY",
    Saturday = "SATURDAY",
    Monday = "MONDAY"
}

export const startWeekOfCountry = [
    { country: "Afghanistan", day: "Saturday" },
    { country: "Albania", day: "Monday" },
    { country: "Algeria", day: "Saturday" },
    { country: "Andorra", day: "Monday" },
    { country: "Argentina", day: "Sunday" },
    { country: "Armenia", day: "Monday" },
    { country: "Australia", day: "Monday" },
    { country: "Austria", day: "Monday" },
    { country: "Azerbaijan", day: "Monday" },
    { country: "Bahrain", day: "Saturday" },
    { country: "Belarus", day: "Monday" },
    { country: "Belgium", day: "Monday" },
    { country: "Belize", day: "Sunday" },
    { country: "Bolivia", day: "Sunday" },
    { country: "Brazil", day: "Sunday" },
    { country: "Brunei", day: "Monday" },
    { country: "Bulgaria", day: "Monday" },
    { country: "Canada", day: "Sunday" },
    { country: "Chile", day: "Sunday" },
    { country: "China", day: "Sunday" },
    { country: "Colombia", day: "Sunday" },
    { country: "Costa Rica", day: "Sunday" },
    { country: "Croatia", day: "Monday" },
    { country: "Czech Republic", day: "Monday" },
    { country: "Denmark", day: "Monday" },
    { country: "Dominican Republic", day: "Sunday" },
    { country: "Ecuador", day: "Sunday" },
    { country: "Egypt", day: "Saturday" },
    { country: "El Salvador", day: "Sunday" },
    { country: "Estonia", day: "Monday" },
    { country: "Finland", day: "Monday" },
    { country: "France", day: "Monday" },
    { country: "French Guiana", day: "Monday" },
    { country: "Georgia", day: "Monday" },
    { country: "Germany", day: "Monday" },
    { country: "Greece", day: "Monday" },
    { country: "Guatemala", day: "Sunday" },
    { country: "Honduras", day: "Sunday" },
    { country: "Hong Kong", day: "Sunday" },
    { country: "Hungary", day: "Monday" },
    { country: "Iceland", day: "Monday" },
    { country: "India", day: "Monday" },
    { country: "Indonesia", day: "Monday" },
    { country: "Iran", day: "Saturday" },
    { country: "Iraq", day: "Saturday" },
    { country: "Ireland", day: "Monday" },
    { country: "Israel", day: "Sunday" },
    { country: "Italy", day: "Monday" },
    { country: "Jamaica", day: "Sunday" },
    { country: "Japan", day: "Sunday" },
    { country: "Jordan", day: "Saturday" },
    { country: "Kazakhstan", day: "Monday" },
    { country: "Kenya", day: "Sunday" },
    { country: "Kosovo", day: "Monday" },
    { country: "Kuwait", day: "Saturday" },
    { country: "Kyrgyzstan", day: "Monday" },
    { country: "Latvia", day: "Monday" },
    { country: "Lebanon", day: "Monday" },
    { country: "Libya", day: "Saturday" },
    { country: "Lithuania", day: "Monday" },
    { country: "Luxembourg", day: "Monday" },
    { country: "Macao", day: "Sunday" },
    { country: "Macedonia", day: "Monday" },
    { country: "Malaysia", day: "Monday" },
    { country: "Mexico", day: "Sunday" },
    { country: "Monaco", day: "Monday" },
    { country: "Mongolia", day: "Monday" },
    { country: "Morocco", day: "Monday" },
    { country: "Netherlands", day: "Monday" },
    { country: "New Zealand", day: "Monday" },
    { country: "Nicaragua", day: "Sunday" },
    { country: "Norway", day: "Monday" },
    { country: "Oman", day: "Saturday" },
    { country: "Pakistan", day: "Monday" },
    { country: "Panama", day: "Sunday" },
    { country: "Paraguay", day: "Monday" },
    { country: "Peru", day: "Sunday" },
    { country: "Philippines", day: "Sunday" },
    { country: "Poland", day: "Monday" },
    { country: "Portugal", day: "Monday" },
    { country: "Puerto Rico", day: "Sunday" },
    { country: "Qatar", day: "Saturday" },
    { country: "Romania", day: "Monday" },
    { country: "Russia", day: "Monday" },
    { country: "Saudi Arabia", day: "Saturday" },
    { country: "Serbia", day: "Monday" },
    { country: "Singapore", day: "Monday" },
    { country: "Slovakia", day: "Monday" },
    { country: "South Africa", day: "Sunday" },
    { country: "South Korea", day: "Sunday" },
    { country: "Spain", day: "Monday" },
    { country: "Sweden", day: "Monday" },
    { country: "Switzerland", day: "Monday" },
    { country: "Syria", day: "Saturday" },
    { country: "Taiwan", day: "Sunday" },
    { country: "Thailand", day: "Monday" },
    { country: "Tunisia", day: "Monday" },
    { country: "Turkey", day: "Monday" },
    { country: "Ukraine", day: "Monday" },
    { country: "United Arab Emirates", day: "Saturday" },
    { country: "United Kingdom", day: "Monday" },
    { country: "United States", day: "Sunday" },
    { country: "Uruguay", day: "Monday" },
    { country: "Uzbekistan", day: "Monday" },
    { country: "Venezuela", day: "Sunday" },
    { country: "Vietnam", day: "Monday" },
    { country: "Yemen", day: "Saturday" },
    { country: "Zimbabwe", day: "Sunday" }
];

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

export function getStartOfWeekByCountry(country:string){
    return convertStartOfWeekToEnum(startWeekOfCountry.filter(c=>c.country === country)[0].day)
}

export interface TimeZone {
    name: string,
    value: number
}

export interface LocationPayload {
    timeZone: TimeZone,
    userOffset: number,
    oldOffset: number,
    country: string
}

export interface Location {
    userOffset: number,
    country: string
    listOfTimeZones: TimeZone[],
    status: statusType,
    error?: string
}

const initialState: Location = {
    userOffset: officeTimeZone[new Date().getMonth()] * 60,
    country: officeCountry,
    listOfTimeZones: [{ name: "Office(Kyiv)", value: officeTimeZone[new Date().getMonth()] * 60 }],
    status: "idle"
}

export interface ChangeLocationPayload {
    oldOffSet: number,
    newOffSet: number
}

export const LocationSlicer = createSlice({
    name: "location",
    initialState,
    reducers: {
        setLocation: (state, action: PayloadAction<LocationPayload>) => {
            state.userOffset = action.payload.userOffset
            state.country = action.payload.country
            state.listOfTimeZones = [...state.listOfTimeZones, action.payload.timeZone]
            state.status = "success"
        },
        changeLocation: (state, action: PayloadAction<ChangeLocationPayload>) => {
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
        clearErrorMessage: (state) => {
            state.error = ""
        },

    }

})

export const {
    setLocation,
    setErrorStatusAndError,
    setloadingStatus,
    setIdleStatus,
    clearErrorMessage,
    changeLocation } = LocationSlicer.actions;
export default LocationSlicer.reducer;