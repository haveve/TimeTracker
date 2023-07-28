export type CalendarDay = {
    title: string,
    start: Date,
    end: Date,
}

export type CalendarDayRequest = {
    title: string,
    startDate: Date,
    endDate: Date,
}

export enum TypeOfGlobalEvent
{
    Celebrate = "CELEBRATE",
    Holiday = "HOLIDAY",
    ShortDay = "SHORT_DAY"
}

export interface GlobalEventsViewModel
{
     name:string,
     date:Date,
     typeOfGlobalEvent:TypeOfGlobalEvent
}