import {User} from "../Types/User";
import {map, Observable} from "rxjs";
import {ajax} from "rxjs/ajax";
import {ApproverNode} from "../Types/ApproverNode";
import {GetAjaxObservable} from "./TimeRequests";
import {TimeRequest} from "../Types/Time";
import App from "../../App";

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

            return res.response.data.vacation.approvers;
        })
    );
}
interface GraphQlAddApprover{
    data: {
        vacation: {
            addApproverForUser: string;
        }

    }
}
export function RequestAddApprover(approverNode:ApproverNode): Observable<string> {
    return ajax<GraphQlAddApprover>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                mutation addApproverForUser($approverId:Int!,$requesterId:Int!){
                    vacation{
                        addApproverForUser(approverUserId: $approverId, requesterUserId: $requesterId)
                    }
                }
            `,
            variables: {
                "approverId": Number(approverNode.approverId),
                "requesterId": Number(approverNode.requesterId)
            }

        })
    }).pipe(
        map(res=>{

            return res.response.data.vacation.addApproverForUser;
        })
    );
}

export function RequestAddApprover1(approverNode:ApproverNode): Observable<ApproverNode> {
    return GetAjaxObservable<string>(`
                mutation addApproverForUser($approverId:Int!,$requesterId:Int!){
                    vacation{
                        addApproverForUser(approverUserId: $approverId, requesterUserId: $requesterId)
                    }
                }
            `,approverNode,true).pipe(
        map(res => {
            if (res.response.errors) {
                console.error(JSON.stringify(res.response.errors))
                throw "error"
            }
            return approverNode
        })
    );
}
interface GraphQlDeleteApprover{
    data: {
        vacation: {
            deleteApprover: string;
        }

    }
}
export function RequestDeleteApprover(approverNode:ApproverNode): Observable<string> {
    return ajax<GraphQlDeleteApprover>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                mutation deleteApprover($approverId:Int!,$requesterId:Int!){
                    vacation{
                        deleteApprover(approverUserId: $approverId, requesterUserId: $requesterId)
                    }
                }
            `,
            variables: {
                "approverId": Number(approverNode.approverId),
                "requesterId": Number(approverNode.requesterId)
            }

        })
    }).pipe(
        map(res=>{

            return res.response.data.vacation.deleteApprover;
        })
    );
}