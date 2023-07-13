import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { getCookie } from "../../Login/Api/login-logout";
import { Time } from "../Types/Time";
import { response } from "../Types/ResponseType";

interface GraphqlTime {
        time:{
            getTime:Time
    }
}
const url = "https://localhost:7226/graphql";



export function GetAjaxObservable<T>(query: string, variables: {}) {
    return ajax<response<T>>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query,
            variables
        })
    })
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


export function RequestSetStartDate(): Observable<string> {
    return GetAjaxObservable<string>(`
    mutation{
        time{
          setStartDate
        }
      }
    `, {}).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data
        })
    );
}

export function RequestSetEndDate(): Observable<string> {
    return GetAjaxObservable<string>(`
    mutation{
        time{
          setEndDate
        }
      }
    `, {}).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data
        })
    );
}

export function RequestUpdateDate(variables: {}): Observable<string> {
    return GetAjaxObservable<string>(`
    mutation($Id:Int!,$Time:InputTimeManage!){
        time{
          manageTime{
            updateTime(time:$Time,userId:$Id)
            }
        }
      }
    `, variables).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data
        })
    );
}