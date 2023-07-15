import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { getCookie } from "../../Login/Api/login-logout";
import { Time, TimeResponse,TimeRequest } from "../Types/Time";
import { response } from "../Types/ResponseType";
import { Alert } from "react-bootstrap";

interface GraphqlTime {
    time: {
        getTime: TimeResponse
    }
}
const url = "https://localhost:7226/graphql";



export function GetAjaxObservable<T>(query: string, variables: {}, token: string = "",withCredentials = false) {
    return ajax<response<T>>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token"),
            'X-XSRF-TOKEN': token
        },
        body: JSON.stringify({
            query,
            variables
        }),
        withCredentials: withCredentials
    })
}

export function RequestGetToken(): Observable<string> {
    return ajax<response<string>>({
        url: url + "-login",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token"),
        },
        body: JSON.stringify({
            query: `query{
        getToken
      }
    `}),
        withCredentials: true
    }).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }

            var token = getCookie('XSRF-TOKEN');

            if (token === null) {
                console.error("Antiforgery token was received with value 'null'")
                throw "error"
            }

            return token;
        })
    );
}

export function RequestGetTime(): Observable<TimeResponse> {
    return GetAjaxObservable<GraphqlTime>(`
    query{
        time{
          getTime{
            isStarted,
            time{
              daySeconds,
              weekSeconds,
              monthSeconds
            }
          }
        }
      }
    `, {}).pipe(
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


export function RequestSetStartDate(token: string): Observable<string> {
    return GetAjaxObservable<string>(`
    mutation{
        time{
          setStartDate
        }
      }
    `, {}, token,true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data
        })
    );
}

export function RequestSetEndDate(token: string): Observable<string> {
    return GetAjaxObservable<string>(`
    mutation{
        time{
          setEndDate
        }
      }
    `, {}, token,true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data
        })
    );
}

export function RequestUpdateDate(time:TimeRequest,token:string): Observable<TimeRequest> {
    return GetAjaxObservable<string>(`
    mutation($id:Int!,$time:ManageTimeInputGrpahqType!){
        time{
          manageTime{
            updateTime(userId:$id,userTime:$time)
            }
        }
      }
    `,time,token,true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return time
        })
    );
}