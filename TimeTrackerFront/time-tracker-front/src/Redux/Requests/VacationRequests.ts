import {User} from "../Types/User";
import {map, Observable} from "rxjs";
import {ajax} from "rxjs/ajax";
import {ApproverNode} from "../Types/ApproverNode";
import {GetAjaxObservable} from "./TimeRequests";
import {TimeRequest} from "../Types/Time";
import App from "../../App";
import {VacationRequest} from "../Types/VacationRequest";

const url = "https://localhost:7226/graphql";

interface GraphQlUsers {
    data: {
        vacation: {
            approvers: User[]
        }
    }
}

export function RequestApprovers(requesterId: Number): Observable<User[]> {
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
        map(res => {
            return res.response.data.vacation.approvers;
        })
    );
}

interface GraphQlAddApprover {
    data: {
        vacation: {
            addApproverForUser: string;
        }

    }
}

export function RequestAddApprover(approverNode: ApproverNode): Observable<string> {
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
        map(res => {

            return res.response.data.vacation.addApproverForUser;
        })
    );
}


interface GraphQlDeleteApprover {
    data: {
        vacation: {
            deleteApprover: string;
        }

    }
}

export function RequestDeleteApprover(approverNode: ApproverNode): Observable<string> {
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
        map(res => {

            return res.response.data.vacation.deleteApprover;
        })
    );
}

interface GraphQlVacationRequests {
    data: {
        vacation: {
            vacationRequest: VacationRequest[]
        }
    }
}

export function RequestVacationRequestsByRequesterId(requesterId: Number): Observable<VacationRequest[]> {
    return ajax<GraphQlVacationRequests>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                query vacationRequest($requesterId:Int!){
                    vacation{
                        vacationRequest(requesterId:$requesterId){
                            id, requesterId, infoAboutRequest, status, startDate, endDate
                        }
                    }
                }
            `,
            variables: {
                "requesterId": Number(requesterId)
            }

        })
    }).pipe(
        map(res => {
            return res.response.data.vacation.vacationRequest;
        })
    );
}

interface GraphQlApproverNodes {
    data: {
        vacation: {
            approversReaction: ApproverNode[]
        }
    }
}

export function RequestApproversReaction(requestId: Number): Observable<ApproverNode[]> {
    return ajax<GraphQlApproverNodes>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                query approversReaction($requestId: Int!){
                    vacation{
                        approversReaction(requestId: $requestId){
                            id, approver{
                                 id,fullName, login, email
                            }
                            isRequestApproved, reactionMessage
                        }
                    }
                }
            `,
            variables: {
                "requestId": Number(requestId)
            }

        })
    }).pipe(
        map(res => {
            console.log("res")
            console.log(res.response)
            return res.response.data.vacation.approversReaction;
        })
    );
}

