import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Session, TimeMark, TimeResponse} from "../Types/Time";
import {itemsInPage} from "../../Components/Time/TimeStatistic";
import {LocationSlicer} from "./LocationSlice";
import {ChangeLocationPayload, Location, officeTimeZone} from "./LocationSlice";
import {LocationPayload} from "./LocationSlice";
import {UpdateTimeReturnType} from "../Requests/TimeRequests";

export type ErrorGraphql = [
    {
        "message": string
        "locations":
            { "line": number, "column": number }[],
        "path": string[],
        "extensions": { "code": string, "codes": string }
    }
]

export type statusType = "idle" | "error" | "success" | "loading";

export type UpdateTime = {
    time: Session,
    oldSDate: Date
}

export type stateTimeType = {
    time: TimeResponse,
    error?: string,
    status: statusType
}

const time: TimeResponse = {
    itemsCount: 0,
    time: {
        daySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
        sessions: []
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
        setStartTime: (state, action: PayloadAction<Date>) => {

            if (state.time.time.sessions.length === itemsInPage)
                state.time.time.sessions.pop()

            state.time.time.sessions.unshift({
                startTimeTrackDate: action.payload,
                endTimeTrackDate: null,
                timeMark: TimeMark.Day
            })
        },
        setEndTime: (state, action: PayloadAction<Date>) => {
            state.time.time.sessions[0].endTimeTrackDate = action.payload
            const differenceInSeconds = Math.floor((state.time.time.sessions[0].endTimeTrackDate.getTime() - state.time.time.sessions[0].startTimeTrackDate.getTime()) / 1000)
            state.time.time.daySeconds += differenceInSeconds;
            state.time.time.weekSeconds += differenceInSeconds;
            state.time.time.monthSeconds += differenceInSeconds;
        },
        updateTime: (state, action: PayloadAction<UpdateTimeReturnType>) => {
            state.time.time.sessions = state.time.time.sessions.map((up) => {
                if (up.startTimeTrackDate.toISOString() === action.payload.oldTime.toISOString()) {
                    switch (up.timeMark) {
                        case TimeMark.Day:
                            state.time.time.daySeconds += action.payload.newSeconds - action.payload.oldSeconds
                            state.time.time.weekSeconds += action.payload.newSeconds - action.payload.oldSeconds
                            state.time.time.monthSeconds += action.payload.newSeconds - action.payload.oldSeconds
                            break;
                        case TimeMark.Week:
                            state.time.time.weekSeconds += action.payload.newSeconds - action.payload.oldSeconds
                            state.time.time.monthSeconds += action.payload.newSeconds - action.payload.oldSeconds
                            break;
                        case TimeMark.Month:
                            state.time.time.monthSeconds += action.payload.newSeconds - action.payload.oldSeconds
                            break;
                    }
                    return action.payload.time
                }
                return up
            })

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
        clearErrorMessage: (state) => {
            state.error = ""
        },
        changeTimerState: (state) => {
            state.time.isStarted = !state.time.isStarted;
        }
    },
    extraReducers: {
        [LocationSlicer.actions.changeLocation.type]: (state, action: PayloadAction<ChangeLocationPayload>) => {
            state.time.time.sessions.forEach(v => {
                v.endTimeTrackDate = v.endTimeTrackDate ? new Date(new Date(v.endTimeTrackDate).getTime() + (action.payload.newOffSet - action.payload.oldOffSet) * 60000) : v.endTimeTrackDate
                v.startTimeTrackDate = new Date(new Date(v.startTimeTrackDate).getTime() + (action.payload.newOffSet - action.payload.oldOffSet) * 60000)
            })
        },
        [LocationSlicer.actions.setLocation.type]: (state, action: PayloadAction<LocationPayload>) => {
            state.time.time.sessions.forEach(v => {
                v.endTimeTrackDate = v.endTimeTrackDate ? new Date(new Date(v.endTimeTrackDate).getTime() + (action.payload.userOffset - action.payload.oldOffset) * 60000) : v.endTimeTrackDate
                v.startTimeTrackDate = new Date(new Date(v.startTimeTrackDate).getTime() + (action.payload.userOffset - action.payload.oldOffset) * 60000)
            })
        },
    }
})

export const timeSlicerAction = timeSlicer.actions;
export const {
    setTime,
    updateTime,
    setEndTime,
    setStartTime,
    setloadingStatus,
    changeTimerState,
    setErrorStatusAndError,
    setIdleStatus,
    clearErrorMessage
} = timeSlicer.actions;
export default timeSlicer.reducer;