export interface Time{
    daySeconds:number,
    weekSeconds:number,
    monthSeconds:number,
    sessions:Session[]
}

export interface Session{
    startTimeTrackDate:Date
    endTimeTrackDate:Date|null
    timeMark:TimeMark
}

export enum TimeMark
{
    Day = "DAY",
    Week = "WEEK",
    Month = "MONTH",
    Year = "YEAR",

}

export interface TimeResponse{
    isStarted:boolean,
    time:Time,
    itemsCount:number
}

export interface TimeRequest{
    time:Time
}