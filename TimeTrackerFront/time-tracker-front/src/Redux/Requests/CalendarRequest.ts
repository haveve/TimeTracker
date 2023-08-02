import { Observable, map } from "rxjs";
import { GetAjaxObservable } from "./TimeRequests";
import { CalendarDay } from "../Types/Calendar";
import { CalendarDayRequest } from "../Types/Calendar";
import { MonthOrWeek } from "../../Components/Calendar";
import { ajax } from "rxjs/ajax";
import { locationOffset } from "../Slices/LocationSlice";
import exp from "constants";

interface GraphqlCalendar {
  calendar: {
    getEvents: CalendarDayRequest[]
  }
}

const geolocationApiUrl = "https://ipgeolocation.abstractapi.com/v1/?api_key=7a512804745e44d5a66fe5150974bc79"

interface GeologationType {
  "city": string,
  "country_code": string,
  timezone: {
    name: string,
    abbreviation: string,
    gmt_offset: number,
    current_time: string,
    is_dst: boolean
  }
}

export function GetLocation(): Observable<GeologationType> {
  return ajax<GeologationType>(geolocationApiUrl)
    .pipe(
      map(res => {
        if (!res.response.timezone.abbreviation) {
          console.error(JSON.stringify(res.response))
          throw "error"
        }
        return res.response
      })
    )
}


export function addEvent(event: CalendarDay, geoOffset: number) {

  const requestData: CalendarDayRequest = {
    title: event.title,
    endDate: new Date(event.end.getTime() + (locationOffset - geoOffset) * 60000),
    startDate: new Date(event.start.getTime() + (locationOffset - geoOffset) * 60000)
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

export function addEventRange(events: CalendarDay[], geoOffset: number) {

  const rangeEvent: CalendarDayRequest[] = events.map(c => ({ title: c.title, endDate: new Date(c.end.getTime() + (locationOffset - geoOffset) * 60000), startDate: new Date(c.start.getTime() + (locationOffset - geoOffset) * 60000) }))

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


export function GetEvents(date: Date, weekOrMonth: MonthOrWeek,userId:number|null): Observable<CalendarDay[]> {

  return GetAjaxObservable<GraphqlCalendar>(`query($userId:Int,$date:DateTime!,$weekOrMonth:MonthOrWeek!){
        calendar{
          getEvents(userId:$userId,date:$date,weekOrMonth:$weekOrMonth){
            title,
            endDate,
            startDate
          }
        }
      }`, {userId,date: date.toISOString(), weekOrMonth }).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res.response.data.calendar.getEvents.map(c => ({ title: c.title, end: new Date(c.endDate), start: new Date(c.startDate) }));
    })
  )
}

export function UpdateEvent(eventStartDate: Date, ev: CalendarDay, geoOffset: number): Observable<string> {

  const event: CalendarDayRequest = {
    title: ev.title,
    endDate: new Date(ev.end.getTime()+(locationOffset-geoOffset)*60000),
    startDate: new Date(ev.start.getTime()+(locationOffset-geoOffset)*60000)
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


export function DeleteEvent(eventStartDate: Date, geoOffset: number): Observable<string> {
  eventStartDate = new Date(eventStartDate.getTime()+(locationOffset-geoOffset)*60000)
  return GetAjaxObservable<string>(`mutation($eventStartDate:DateTime!){
    calendar{
      deleteEvent(eventStartDate:$eventStartDate)
    }
  }`, { eventStartDate }).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res.response.data
    })
  )
}

export interface GetCalendarGraphType {
  calendar:{
    getCalendarUser:{
      count:number,
      calendarUsers:CalendarUser[]
    }
  }
}

export interface CalendarUserPage{
    count:number,
    calendarUsers:CalendarUser[]
}

export interface CalendarUser{
    id:number,
    fullName:string,
    email:string
}

export function GetCalendarUsers(pageNumber:number,itemsInPage:number,search:string){
  return GetAjaxObservable<GetCalendarGraphType>(`query($pageNumber:Int!,$itemsInPage:Int!,$search:String!){
    calendar{
      getCalendarUser(pageNumber:$pageNumber,itemsInPage:$itemsInPage,search:$search){
        count,
        calendarUsers{
          id,
          fullName,
          email
        }
      }
    }
  }`,{pageNumber,itemsInPage,search}).pipe(
    map(res => {
      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }
      return res.response.data.calendar.getCalendarUser
    }))
}