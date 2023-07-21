import { Observable, map } from "rxjs";
import { GetAjaxObservable } from "./TimeRequests";
import { CalendarDay } from "../Types/Calendar";
import { CalendarDayRequest } from "../Types/Calendar";
import { MonthOrWeek } from "../../Components/Calendar";

interface GraphqlCalendar {
  calendar: {
    getEvents: CalendarDayRequest[]
  }
}

export function addEvent(event: CalendarDay) {

  const requestData: CalendarDayRequest = {
    title: event.title,
    endDate: event.end,
    startDate: event.start
  };
  return GetAjaxObservable<string>(`mutation($event:CalendarInput!){
        calendar{
          createEvent(event:$event)
        }
      }`, {
    event: {
      ...requestData
    }
  }).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res;
    })
  )
}

export function addEventRange(events: CalendarDay[]) {

  const rangeEvent: CalendarDayRequest[] = events.map(c => ({ title: c.title, endDate: c.end, startDate: c.start }))

  return GetAjaxObservable<string>(`mutation($rangeEvent:[CalendarInput!]){
    calendar{
    createRangeEvent(rangeEvent:$rangeEvent)
  }
    }`, {
    rangeEvent: [
      ...rangeEvent
    ]
  }).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res;
    })
  )
}


export function GetEvents(date: Date, weekOrMonth: MonthOrWeek): Observable<CalendarDay[]> {

  return GetAjaxObservable<GraphqlCalendar>(`query($date:DateTime!,$weekOrMonth:MonthOrWeek!){
        calendar{
          getEvents(date:$date,weekOrMonth:$weekOrMonth){
            title,
            endDate,
            startDate
          }
        }
      }`, { date: date.toISOString(), weekOrMonth }).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res.response.data.calendar.getEvents.map(c => ({ title: c.title, end: new Date(c.endDate), start: new Date(c.startDate) }));
    })
  )
}

export function UpdateEvent(eventStartDate: Date, ev: CalendarDay): Observable<string> {

  const event: CalendarDayRequest = {
    title: ev.title,
    endDate: ev.end,
    startDate: ev.start
  };

  return GetAjaxObservable<string>(`mutation($eventStartDate:DateTime!,$event:CalendarInput!){
    calendar{
      updateEvent(eventStartDate:$eventStartDate,event:$event)
    }
  }`, { eventStartDate, event }).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res.response.data
    })
  )
}


export function DeleteEvent(eventStartDate: Date): Observable<string> {
  return GetAjaxObservable<string>(`mutation($eventStartDate:DateTime!){
    calendar{
      deleteEvent(eventStartDate:$eventStartDate)
    }
  }`, { eventStartDate}).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res.response.data
    })
  )
}