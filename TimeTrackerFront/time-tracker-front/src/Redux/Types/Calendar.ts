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
    ShortDay = "SHORTDAY",
    Holiday = "HOLIDAY"
}

export interface GlobalEventsViewModel
{
     name:string,
     date:Date,
     typeOfGlobalEvent:TypeOfGlobalEvent
}