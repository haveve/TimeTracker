import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { getCookie} from "../../Login/Api/login-logout";
import { Time, TimeResponse,TimeRequest } from "../Types/Time";
import { response } from "../Types/ResponseType";
import { Alert } from "react-bootstrap";

interface GraphqlTime {
    time: {
        getTime: TimeResponse
    }
}

interface GraphqlToken {
    getToken:string
}

const url = "https://time-tracker3.azurewebsites.net/graphql";



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


export function RequestSetStartDate(): Observable<string> {
    return GetAjaxObservable<string>(`
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
    `, {},true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return res.response.data
        })
    );
}

export function RequestUpdateDate(time:TimeRequest): Observable<TimeRequest> {
    return GetAjaxObservable<string>(`
    mutation($id:Int!,$time:ManageTimeInputGrpahqType!){
        time{
          manageTime{
            updateTime(userId:$id,userTime:$time)
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