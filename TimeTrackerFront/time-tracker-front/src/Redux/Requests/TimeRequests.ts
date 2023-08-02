import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { getCookie} from "../../Login/Api/login-logout";
import { Time, TimeResponse,TimeRequest,TimeMark } from "../Types/Time";
import { response } from "../Types/ResponseType";
import { Alert } from "react-bootstrap";

interface GraphqlTime {
    time: {
        getTime: TimeResponse
    }
}

const url = "https://localhost:7226/graphql";



export function GetAjaxObservable<T>(query: string, variables: {},withCredentials = false) {

    return ajax<response<T>>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token"),
        },
        body: JSON.stringify({
            query,
            variables
        }),
        withCredentials: withCredentials
    })
}

export function RequestGetTime(timeMark:TimeMark[],pageNumber:number,itemsInPage:number): Observable<TimeResponse> {
    return GetAjaxObservable<GraphqlTime>(`
    query($timeMark:[TimeMark!]!,$pageNumber:Int!,$itemsInPage:Int!){
        time{
          getTime(timeMark:$timeMark,pageNumber:$pageNumber,itemsInPage:$itemsInPage){
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
    `, {timeMark,pageNumber,itemsInPage}).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            let time = res.response.data.time.getTime;
            time.time.sessions.forEach(v=>{
                v.endTimeTrackDate = v.endTimeTrackDate?new Date(v.endTimeTrackDate):v.endTimeTrackDate
                v.startTimeTrackDate = new Date(v.startTimeTrackDate)
            })
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
    `, {id}).pipe(
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
    time:{
        setStartDate:Date
      }
}
export function RequestSetStartDate(): Observable<Date> {
    return GetAjaxObservable<setStartDate>(`
    mutation{
        time{
          setStartDate
        }
      }
    `, {},true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return new Date (res.response.data.time.setStartDate)
        })
    );
}

type setEndDate = {
    time:{
        setEndDate:Date
      }
}

export function RequestSetEndDate(): Observable<Date> {
    return GetAjaxObservable<setEndDate>(`
    mutation{
        time{
          setEndDate
        }
      }
    `, {},true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return new Date (res.response.data.time.setEndDate)
        })
    );
}

export function RequestUpdateDate(time:TimeRequest): Observable<TimeRequest> {
    return GetAjaxObservable<string>(`
    mutation($time:ManageTimeInputGrpahqType!){
        time{
          manageTime{
            updateTime(userTime:$time)
            }
        }
      }
    `,time,true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return time
        })
    );
}