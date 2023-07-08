import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { getCookie } from "../../Login/Api/login-logout";
import { Time } from "../Types/Time";

interface GraphqlTime {
    data: {
        time:{
            getTime:Time
        }
    }
}
export function RequestGetTime(): Observable<Time> {
    return ajax<GraphqlTime>({
        url: "https://localhost:7226/graphql",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            query{
                time{
                  getTime{
                    monthSeconds,
                    daySeconds,
                    weekSeconds
                  }
                }
            }
            `
        })
    }).pipe(
        map(res => {
            let time: Time = res.response.data.time.getTime;
            return time;
        })
    );
}

export function RequestAddOneSecond(): Observable<string> {
    return ajax<string>({
        url: "https://localhost:7226/graphql",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation{
                time{
                  addOneSecond
                }
              }
            `
        })
    }).pipe(
        map(res => res.response)
    );
}