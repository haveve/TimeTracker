import {TimeMark, TimeResponse} from "./Types/Time";
import {Epic, ofType} from "redux-observable";
import {catchError, map, mergeMap, Observable, of} from "rxjs";
import {PayloadAction} from "@reduxjs/toolkit";
import {RequestGetTime, RequestSetEndDate, RequestSetStartDate} from "./Requests/TimeRequests";
import {getStartOfWeekByCountry} from "./Slices/LocationSlice";
import {
    setEndTime,
    setErrorStatusAndError as setErrorStatusAndErrorTime,
    setStartTime,
    setTime
} from "./Slices/TimeSlice";
import {ErrorMassagePattern} from "./epics";


export interface TimePayloadType{
    timeMark:TimeMark[],
    pageNumber:number,
    itemsInPage:number,
    offset:number,
    country:string
}

export const setTimeE = (timeMark:TimeMark[],pageNumber:number,itemsInPage:number,offset:number,country:string) => ({type: "setTime",payload:{
        timeMark,pageNumber,itemsInPage,offset,country
    }})
export const setTimeEpic: Epic = (action$:Observable<PayloadAction<TimePayloadType>>)=> {

    return action$.pipe(
        ofType("setTime"),
        map(a=>a.payload),
        mergeMap((p) => RequestGetTime(p.timeMark,p.pageNumber,p.itemsInPage,p.offset,getStartOfWeekByCountry(p.country)).pipe(
            map((res: TimeResponse) => setTime(res)),
            catchError(() => of(setErrorStatusAndErrorTime(ErrorMassagePattern)))
        )),
    )
};

export const setStartTimeE = (offset:number) => ({type: "setStartTime",payload:offset})
export const setStartTimeEpic: Epic = (action$:Observable<PayloadAction<number>>)=> {
    return action$.pipe(
        ofType("setStartTime"),
        map(a=>a.payload),
        mergeMap((offset) => RequestSetStartDate(offset).pipe(
            map((res) => setStartTime(res)),
            catchError(() => of(setErrorStatusAndErrorTime(ErrorMassagePattern)))
        )),
    )
};


export const setEndTimeE = (offset:number) => ({type: "setEndTime",payload:offset})
export const setEndTimeEpic: Epic = (action$:Observable<PayloadAction<number>>)=> {
    return action$.pipe(
        ofType("setEndTime"),
        map(a=>a.payload),
        mergeMap((offset) => RequestSetEndDate(offset).pipe(
            map((res) => setEndTime(res)),
            catchError(() => of(setErrorStatusAndErrorTime(ErrorMassagePattern)))
        )),
    )
};