import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { getCookie} from "../../Login/Api/login-logout";
import { Time, TimeResponse,TimeRequest,TimeMark } from "../Types/Time";
import { response } from "../Types/ResponseType";
import { Alert } from "react-bootstrap";
import { locationOffset } from "../Slices/LocationSlice";

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

export function RequestGetTime(timeMark:TimeMark[],pageNumber:number,itemsInPage:number,offset:number): Observable<TimeResponse> {
    return GetAjaxObservable<GraphqlTime>(`
    query($offset:Int,$timeMark:[TimeMark!]!,$pageNumber:Int!,$itemsInPage:Int!){
        time{
          getTime(timeMark:$timeMark,pageNumber:$pageNumber,itemsInPage:$itemsInPage,offSet:$offset){
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
    `, {offset:offset/60,timeMark,pageNumber,itemsInPage}).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            let time = res.response.data.time.getTime;
            time.time.sessions.forEach(v=>{
                v.endTimeTrackDate = v.endTimeTrackDate?new Date(new Date(v.endTimeTrackDate).getTime()+offset*60000) :v.endTimeTrackDate
                v.startTimeTrackDate = new Date(new Date(v.startTimeTrackDate).getTime()+offset*60000) 
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
export function RequestSetStartDate(offset:number): Observable<Date> {
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
            return new Date(new Date (res.response.data.time.setStartDate).getTime() - (locationOffset - offset)*60000)
        })
    );
}

type setEndDate = {
    time:{
        setEndDate:Date
      }
}

export function RequestSetEndDate(offset:number): Observable<Date> {
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
            return new Date(new Date (res.response.data.time.setEndDate).getTime() - (locationOffset - offset)*60000)
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