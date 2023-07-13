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
const url = "https://localhost:7226/graphql";


export function RequestGetTime(): Observable<Time> {
    return ajax<GraphqlTime>({
        url,
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


export function RequestSetStartDate(): Observable<string> {
    return ajax<string>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation{
                time{
                  setStartDate
                }
              }              
            `
        })
    }).pipe(
        map(res => res.response)
    );
}

export function RequestSetEndDate(): Observable<string> {
    return ajax<string>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation{
                time{
                  setEndDate
                }
              }
            `
        })
    }).pipe(
        map(res => res.response)
    );
}

export function RequestUpdateDate(variables: {}): Observable<string> {
    return ajax<string>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation($Id:Int!,$Time:InputTimeManage!){
                time{
                  manageTime{
                    updateTime(time:$Time,userId:$Id)
                    }
                }
              }
            `,
            variables
        })
    }).pipe(
        map(res => res.response)
    );
}