import {User} from "../Types/User";
import {map, Observable} from "rxjs";
import {ajax} from "rxjs/ajax";

const url = "https://localhost:7226/graphql";

interface GraphQlUsers {
    data:{
        vacation:{
            approvers: User[]
        }
    }
}

export function RequestApprovers(requesterId:Number): Observable<User[]> {
    return ajax<GraphQlUsers>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                query GetApprovers($requesterId:Int!){
                    vacation{
                        approvers(requesterId: $requesterId){
                            id, login, fullName, email
                        }
                    }
                }
            `,
            variables: {
                "requesterId": Number(requesterId)
            }

        })
    }).pipe(
        map(res=>{
            console.log(res.response.data.vacation);
            return res.response.data.vacation.approvers;
        })
    );
}