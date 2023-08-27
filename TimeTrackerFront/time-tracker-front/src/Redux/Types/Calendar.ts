export type CalendarDay = {
    title: string,
    start: Date,
    end: Date,
    type:null|SpecialEventType
}

export type CalendarDayRequest = {
    title: string,
    startDate: Date,
    endDate: Date,
}

export type CalendarDayResponse = {
    title: string,
    startDate: Date,
    endDate: Date,
    type:null|SpecialEventType
}

export enum TypeOfGlobalEvent {
    Celebrate = "CELEBRATE",
    Holiday = "HOLIDAY",
    ShortDay = "SHORT_DAY"
}

export interface GlobalEventsViewModel {
    name: string,
    date: Date,
    typeOfGlobalEvent: TypeOfGlobalEvent
}

export enum SpecialEventType {
    Ill = "ILL",
    Ansent = "ANSENT",
    Vacation = "VACATION"
}