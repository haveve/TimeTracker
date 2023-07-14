import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { getCookie } from "../../Login/Api/login-logout";
import { Time } from "../Types/Time";
import { response } from "../Types/ResponseType";

interface GraphqlTime {
    time: {
        getTime: Time
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

export function RequestGetTime(): Observable<Time> {
    return GetAjaxObservable<GraphqlTime>(`
    query{
        time{
          getTime{
            monthSeconds,
            daySeconds,
            weekSeconds
          }
        }
    }
    `, {}).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }

            let time: Time = res.response.data.time.getTime;
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

export function RequestUpdateDate(variables: {},token:string): Observable<string> {
    return GetAjaxObservable<string>(`
    mutation($Id:Int!,$Time:InputTimeManage!){
        time{
          manageTime{
            updateTime(time:$Time,userId:$Id)
            }
        }
      }
    `, variables,token,true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data
        })
    );
}