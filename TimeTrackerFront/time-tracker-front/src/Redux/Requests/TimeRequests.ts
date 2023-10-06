import { ajax } from "rxjs/internal/ajax/ajax";
import { catchError, map, mergeMap, Observable, of, timer } from "rxjs";
import { getCookie, IsRefreshError, RefreshError, setCookie } from "../../Login/Api/login-logout";
import { TimeResponse, TimeRequest, TimeMark } from "../Types/Time";
import { response } from "../Types/ResponseType";
import { startOfWeek } from "../Slices/LocationSlice";
import { Session } from "../Types/Time";
import { ErrorGraphql } from "../Slices/TimeSlice";
import { StoredTokenType, ajaxForRefresh } from "../../Login/Api/login-logout";
import { LogoutDeleteCookie } from "../../Components/Navbar";
import { GetUtcTime, GetDateWithJsOffset } from "./CalendarRequest";
import { Alert } from "react-bootstrap";

interface GraphqlTime {
    time: {
        getTime: TimeResponse
    }
}
interface GraphqlTimerIsStarted {
    time: {
        isStarted: boolean
    }
}

interface GraphqlUserTime {
    time: {
        getUserTime: TimeResponse
    }
}

export const domainBack = "time-tracker3.azurewebsites.net";
const url = "https://"+domainBack+"/graphql";

export enum RefreshStatus {
    DoRefresh,
    DonotRefresh,
    ThereIsNoRefreshes
}

export function TokenErrorHandler() {
    LogoutDeleteCookie()
}

export function GetTokenObservable() {
    return DoRefresh(WhetherDoRefresh())
}

export type DoRefreshType = {
    refresh_token: string,
    refreshStatus: RefreshStatus
}

export function DoRefresh(refresh: DoRefreshType) {

    switch (refresh.refreshStatus) {
        case RefreshStatus.DoRefresh:
            const refreshSentString = getCookie("refresh_sent");
            const isTokenSent: boolean = refreshSentString ? JSON.parse(refreshSentString) : refreshSentString
            if (!isTokenSent) {
                setCookie({ name: "refresh_sent", value: "true" })
                ajaxForRefresh({}, refresh.refresh_token).subscribe({
                    error: () => {
                        TokenErrorHandler()
                    },
                    next: () => {
                        setCookie({ name: "refresh_sent", value: "false" })
                    }
                })
            }
            break;
        case RefreshStatus.DonotRefresh:
            break;
        case RefreshStatus.ThereIsNoRefreshes:
            TokenErrorHandler();
            break;
    }

    return new Observable<void>((subscriber) => {
        const sub = timer(10, 20).subscribe({
            next: () => {
                let refreshSentString = getCookie("refresh_sent");
                let isTokenSent: boolean = refreshSentString ? JSON.parse(refreshSentString) : refreshSentString

                if (!isTokenSent) {
                    subscriber.next()
                    sub.unsubscribe()
                }
            }
        })
    })


}

export function WhetherDoRefresh(): DoRefreshType {

    const refreshTokenJson = getCookie("refresh_token");
    const accessTokenJson = getCookie("access_token");

    if (refreshTokenJson) {
        const refreshTokenObj: StoredTokenType = JSON.parse(refreshTokenJson);
        if (accessTokenJson) {

            const accessTokenObj: StoredTokenType = JSON.parse(accessTokenJson)
            const nowInSeconds = new Date().getTime();
            if (!accessTokenObj ||
                accessTokenObj.expiredAt - nowInSeconds < 2000) {
                return {
                    refresh_token: refreshTokenObj.token,
                    refreshStatus: RefreshStatus.DoRefresh
                }
            }
            return {
                refresh_token: "",
                refreshStatus: RefreshStatus.DonotRefresh
            }
        }
        return {
            refresh_token: refreshTokenObj.token,
            refreshStatus: RefreshStatus.DoRefresh
        }

    }
    return {
        refresh_token: "",
        refreshStatus: RefreshStatus.ThereIsNoRefreshes
    }

}

export enum TokenAjaxStatus {
    Ok,
    Error
}

export function GetAjaxObservable<T>(query: string, variables: {}, withCredentials = false,requestUrl = url,forGraphql = true) {

    return GetTokenObservable().pipe(
        mergeMap(() => {
            const token: StoredTokenType = JSON.parse(getCookie("access_token")!)
            return ajax<response<T>>({
                url:requestUrl,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token.token,
                },
                body: JSON.stringify({
                    query,
                    variables
                }),
                withCredentials: withCredentials
            })
        }),
        catchError((error) => {

            throw "error"
        }
        )
    )
}


export function RequestUserTime(id: number, timeMark: TimeMark[], pageNumber: number, itemsInPage: number, offset: number, startOfWeek: startOfWeek): Observable<TimeResponse> {
    return GetAjaxObservable<GraphqlUserTime>(`
    query($id: Int!, $startOfWeek:StartOfWeek!,$offset:Int,$timeMark:[TimeMark!]!,$pageNumber:Int!,$itemsInPage:Int!){
        time{
          getUserTime(id: $id, timeMark:$timeMark,pageNumber:$pageNumber,itemsInPage:$itemsInPage,offSet:$offset,startOfWeek:$startOfWeek){
            itemsCount,
            isStarted,
          time{
          daySeconds
          weekSeconds
          monthSeconds
          sessions {
            startTimeTrackDate
            endTimeTrackDate
            timeMark
          }
        }
      }
        }
      }
    `, { id, offset: offset / 60, timeMark, pageNumber, itemsInPage, startOfWeek }).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            let time = res.response.data.time.getUserTime;
            time.time.sessions.forEach(v => {
                v.endTimeTrackDate = v.endTimeTrackDate ? new Date(new Date(v.endTimeTrackDate).getTime() + offset * 60000) : v.endTimeTrackDate
                v.startTimeTrackDate = new Date(new Date(v.startTimeTrackDate).getTime() + offset * 60000)
            })
            return time;
        })
    );
}

export function RequestGetTime(timeMark: TimeMark[], pageNumber: number, itemsInPage: number, offset: number, startOfWeek: startOfWeek): Observable<TimeResponse> {

    return GetAjaxObservable<GraphqlTime>(`
    query($startOfWeek:StartOfWeek!,$offset:Int,$timeMark:[TimeMark!]!,$pageNumber:Int!,$itemsInPage:Int!){
        time{
          getTime(timeMark:$timeMark,pageNumber:$pageNumber,itemsInPage:$itemsInPage,offSet:$offset,startOfWeek:$startOfWeek){
            itemsCount,
            isStarted,
          time{
          daySeconds
          weekSeconds
          monthSeconds
          sessions {
            startTimeTrackDate
            endTimeTrackDate
            timeMark
          }
        }
      }
        }
      }
    `, { offset: offset / 60, timeMark, pageNumber, itemsInPage, startOfWeek }).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            let time = res.response.data.time.getTime;
            time.time.sessions.forEach(v => {
                v.endTimeTrackDate = v.endTimeTrackDate ? new Date(new Date(v.endTimeTrackDate).getTime() + offset * 60000) : v.endTimeTrackDate
                v.startTimeTrackDate = new Date(new Date(v.startTimeTrackDate).getTime() + offset * 60000)
            })
            return time;
        })
    );
}

export function GetWhetherTimerIsStarted(): Observable<boolean> {

    return GetAjaxObservable<GraphqlTimerIsStarted>(`
    query{
        time{
            isStarted
        }
      }
    `, {}).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data.time.isStarted;
        })
    );
}

export function RequestGetTimeInSeconds(timeMark: TimeMark[], pageNumber: number, itemsInPage: number, offset: number, startOfWeek: startOfWeek): Observable<TimeResponse> {

    return GetAjaxObservable<GraphqlTime>(`
    query($startOfWeek:StartOfWeek!,$offset:Int,$timeMark:[TimeMark!]!,$pageNumber:Int!,$itemsInPage:Int!){
        time{
          getTime(timeMark:$timeMark,pageNumber:$pageNumber,itemsInPage:$itemsInPage,offSet:$offset,startOfWeek:$startOfWeek){
          time{
          daySeconds
          weekSeconds
          monthSeconds
        }
      }
        }
      }
    `, { offset: offset / 60, timeMark, pageNumber, itemsInPage, startOfWeek }).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            let time = res.response.data.time.getTime;
            return time;
        })
    );
}

interface GraphqlTotalTime {
    time: {
        getTotalWorkTime: number
    }
}

export function RequestGetTotalWorkTime(id: number): Observable<number> {
    return GetAjaxObservable<GraphqlTotalTime>(`
    query($id: Int!){
        time{
            getTotalWorkTime(id: $id)
          }
        }
    `, { id }).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }

            let time = res.response.data.time.getTotalWorkTime;
            return time;
        })
    );
}


type setStartDate = {
    time: {
        setStartDate: Date
    }
}
export function RequestSetStartDate(offset: number): Observable<Date> {
    return GetAjaxObservable<setStartDate>(`
    mutation{
        time{
          setStartDate
        }
      }
    `, {}, true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error";
            }
            return GetUtcTime(new Date(res.response.data.time.setStartDate), offset);
        })
    );
}

type setEndDate = {
    time: {
        setEndDate: Date
    }
}

export function RequestSetEndDate(offset: number): Observable<Date> {
    return GetAjaxObservable<setEndDate>(`
    mutation{
        time{
          setEndDate
        }
      }
    `, {}, true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return GetUtcTime(new Date(res.response.data.time.setEndDate), offset);
        })
    );
}

export interface UpdateTimeResult {
    time: {
        manageTime: {
            updateTime: {
                oldSeconds: number,
                newSeconds: number
            }
        }
    }
}

export interface UpdateUserTimeResult {
    time: {
        manageTime: {
            updateUserTime: string
        }
    }
}

export interface DeleteUserTimeResult {
    time: {
        manageTime: {
            deleteUserTime: string
        }
    }
}

export interface CreateUserTimeResult {
    time: {
        manageTime: {
            createUserTime: string
        }
    }
}

export interface UpdateTimeReturnType {
    oldSeconds: number,
    newSeconds: number,
    time: Session,
    oldTime: Date
}

export function RequestUpdateDate(oldTime: Session, time: Session, offset: number, startOfWeek: startOfWeek): Observable<UpdateTimeReturnType> {

    time.endTimeTrackDate = GetUtcTime(time.endTimeTrackDate!, offset)
    time.startTimeTrackDate = GetUtcTime(time.startTimeTrackDate, offset)

    const oldStartTime = oldTime.startTimeTrackDate;
    const timeBeforeSent = { ...time };

    oldTime.endTimeTrackDate = GetUtcTime(oldTime.endTimeTrackDate!, offset)
    oldTime.startTimeTrackDate = GetUtcTime(oldTime.startTimeTrackDate, offset)


    return GetAjaxObservable<UpdateTimeResult>(`
    mutation($oldTime:ManageTimeInputGrpahqType!,$time:ManageTimeInputGrpahqType!,$offset:Int,$startOfWeek:StartOfWeek!){
        time{
          manageTime{
            updateTime(oldTime:$oldTime,userTime:$time,offSet:$offset,startOfWeek:$startOfWeek){
                oldSeconds,
                newSeconds
            }
          }
        }
    }
    `, {
        oldTime: {
            endTimeTrackDate: oldTime.endTimeTrackDate,
            startTimeTrackDate: oldTime.startTimeTrackDate,
        }, time: {
            endTimeTrackDate: time.endTimeTrackDate,
            startTimeTrackDate: time.startTimeTrackDate,
        }, offset: offset / 60,
        startOfWeek
    }, true).pipe(
        map(res => {

            const sqlErro: ErrorGraphql = res.response.errors;
            if (sqlErro && sqlErro[0].extensions.code === "SQL") {
                console.error(JSON.stringify(res.response.errors))
                throw "SQL"
            }
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }

            const timeReturn: UpdateTimeReturnType = {
                oldTime: oldStartTime,
                time: timeBeforeSent,
                oldSeconds: res.response.data.time.manageTime.updateTime.oldSeconds,
                newSeconds: res.response.data.time.manageTime.updateTime.newSeconds
            }

            return timeReturn;
        })
    );
}

export function RequestUpdateUserDate(Id: number, oldTime: Session, time: Session, offset: number, startOfWeek: startOfWeek): Observable<string> {

    time.endTimeTrackDate = GetUtcTime(time.endTimeTrackDate!, offset)
    time.startTimeTrackDate = GetUtcTime(time.startTimeTrackDate, offset)

    oldTime.endTimeTrackDate = GetUtcTime(oldTime.endTimeTrackDate!, offset)
    oldTime.startTimeTrackDate = GetUtcTime(oldTime.startTimeTrackDate, offset)
    let userId: Number = Number(Id)

    return GetAjaxObservable<UpdateUserTimeResult>(`
    mutation($userId: Int!, $oldTime:ManageTimeInputGrpahqType!,$time:ManageTimeInputGrpahqType!,$offset:Int,$startOfWeek:StartOfWeek!){
        time{
          manageTime{
            updateUserTime(id: $userId, oldTime:$oldTime,userTime:$time,offSet:$offset,startOfWeek:$startOfWeek)
          }
        }
    }
    `, {
        userId,
        oldTime: {
            endTimeTrackDate: oldTime.endTimeTrackDate,
            startTimeTrackDate: oldTime.startTimeTrackDate,
        }, time: {
            endTimeTrackDate: time.endTimeTrackDate,
            startTimeTrackDate: time.startTimeTrackDate,
        }, offset: offset / 60,
        startOfWeek
    }, true).pipe(
        map(res => {

            const sqlErro: ErrorGraphql = res.response.errors;
            if (sqlErro && sqlErro[0].extensions.code === "SQL") {
                console.error(JSON.stringify(res.response.errors))
                throw "SQL"
            }
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }

            return res.response.data.time.manageTime.updateUserTime;
        })
    );
}

export function RequestDeleteUserDate(Id: number, time: Session, offset: number): Observable<string> {

    time.endTimeTrackDate = GetUtcTime(time.endTimeTrackDate!, offset)
    time.startTimeTrackDate = GetUtcTime(time.startTimeTrackDate, offset)

    let userId: Number = Number(Id)

    return GetAjaxObservable<DeleteUserTimeResult>(`
    mutation($userId: Int!,$time:ManageTimeInputGrpahqType!){
        time{
          manageTime{
            deleteUserTime(id: $userId,userTime:$time)
          }
        }
    }
    `, {
        userId,
        time: {
            endTimeTrackDate: time.endTimeTrackDate,
            startTimeTrackDate: time.startTimeTrackDate,
        }
    }, true).pipe(
        map(res => {

            const sqlErro: ErrorGraphql = res.response.errors;
            if (sqlErro && sqlErro[0].extensions.code === "SQL") {
                console.error(JSON.stringify(res.response.errors))
                throw "SQL"
            }
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }

            return res.response.data.time.manageTime.deleteUserTime;
        })
    );
}

export function RequestCreateUserDate(Id: number, time: Session, offset: number): Observable<string> {

    time.endTimeTrackDate = GetUtcTime(time.endTimeTrackDate!, offset)
    time.startTimeTrackDate = GetUtcTime(time.startTimeTrackDate, offset)

    let userId: Number = Number(Id)

    return GetAjaxObservable<CreateUserTimeResult>(`
    mutation($userId: Int!,$time:ManageTimeInputGrpahqType!){
        time{
          manageTime{
            createUserTime(id: $userId,userTime:$time)
          }
        }
    }
    `, {
        userId,
        time: {
            endTimeTrackDate: time.endTimeTrackDate,
            startTimeTrackDate: time.startTimeTrackDate,
        }
    }, true).pipe(
        map(res => {

            const sqlErro: ErrorGraphql = res.response.errors;
            if (sqlErro && sqlErro[0].extensions.code === "SQL") {
                console.error(JSON.stringify(res.response.errors))
                throw "SQL"
            }
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }

            return res.response.data.time.manageTime.createUserTime;
        })
    );
}