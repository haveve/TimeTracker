import {User} from "../Types/User";
import {map, Observable} from "rxjs";
import {ajax} from "rxjs/ajax";
import {ApproverNode} from "../Types/ApproverNode";
import {GetAjaxObservable} from "./TimeRequests";
import {TimeRequest} from "../Types/Time";
import App from "../../App";
import {VacationRequest} from "../Types/VacationRequest";
import {vacationState} from "../Slices/VacationSlice";
import {InputVacationRequest} from "../Types/InputVacationRequest";
import {InputApproverReaction} from "../Types/InputApproverReaction";
import {InputVacRequest} from "../Types/InputVacRequest";

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
                "approverId": Number(approverNode.userIdApprover),
                "requesterId": Number(approverNode.userIdRequester)
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
                "approverId": Number(approverNode.userIdApprover),
                "requesterId": Number(approverNode.userIdRequester)
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

export function RequestVacationRequestsByRequesterId(inputVacRequest: InputVacRequest): Observable<VacationRequest[]> {
    return ajax<GraphQlVacationRequests>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                query vacationRequest($requesterId:Int!, $requestStatus:String!){
                    vacation{
                        vacationRequest(requesterId:$requesterId, requestStatus:$requestStatus){
                            id, requesterId, infoAboutRequest, status, startDate, endDate
                        }
                    }
                }
            `,
            variables: {
                "requesterId": Number(inputVacRequest.approverOrRequesterId),
                "requestStatus": String(inputVacRequest.requestStatus)
            }

        })
    }).pipe(
        map(res => {
            return res.response.data.vacation.vacationRequest;
        })
    );
}


interface GraphQlIncomingVacationRequests {
    data: {
        vacation: {
            vacationRequest: VacationRequest[]
        }
    }
}

export function RequestIncomingVacationRequestsByApproverId(inputVacRequest: InputVacRequest): Observable<VacationRequest[]> {
    return ajax<GraphQlIncomingVacationRequests>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                query vacationRequest($approverId:Int!, $requestStatus:String!){
                    vacation{
                        vacationRequest(approverId:$approverId, requestStatus:$requestStatus){
                            id,
      requesterId, 
      requester{
        id,login,fullName, email
      }
      infoAboutRequest,
      status,
      startDate,
      endDate,
      approversNodes{
        id,
        isRequestApproved,
        userIdRequester,
        userIdApprover,
        reactionMessage
      }
                        }
                    }
                }
            `,
            variables: {
                "approverId": Number(inputVacRequest.approverOrRequesterId),
                "requestStatus": String(inputVacRequest.requestStatus)

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
            return res.response.data.vacation.approversReaction;
        })
    );
}

interface GraphQlAddApproverReaction {
    data: {
        vacation: {
            addApproverReaction: string
        }
    }
}


export function RequestAddApproverReaction(inputApproverReaction:InputApproverReaction){
    return ajax<GraphQlAddApproverReaction>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                mutation addApproverReaction($approverUserId:Int!,$requestId:Int!,$reaction: Boolean!, $reactionMessage: String!){
                    vacation{
                        addApproverReaction(approverUserId: $approverUserId, requestId: $requestId, reaction: $reaction, reactionMessage:$reactionMessage)
                    }
                }
            `,
            variables: {
                "approverUserId":Number(inputApproverReaction.approverId),
                "requestId": Number(inputApproverReaction.requestId),
                "reaction": Boolean(inputApproverReaction.reaction),
                "reactionMessage": String(inputApproverReaction.reactionMessage),
            }
        })
    }).pipe(
        map(res => {

            return res.response.data.vacation.addApproverReaction;
        })
    );
}




interface GraphQlCancelVacationRequest {
    data: {
        vacation: {
            cancelVacationRequest: string
        }
    }
}


export function RequestCancelVacationRequest(vacationRequest:VacationRequest){
    return ajax<GraphQlCancelVacationRequest>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                mutation cancelVacationRequest($requestId:Int!){
                    vacation{
                        cancelVacationRequest(requestId:$requestId)
                    }
                }
            `,
            variables: {
                "requestId": Number(vacationRequest.id)
            }

        })
    }).pipe(
        map(res => {

            return res.response.data.vacation.cancelVacationRequest;
        })
    );
}

interface GraphQlDeleteVacationRequest {
    data: {
        vacation: {
            deleteVacationRequest: string
        }
    }
}


export function RequestDeleteVacationRequest(vacationRequest:VacationRequest){
    return ajax<GraphQlDeleteVacationRequest>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                mutation deleteVacationRequest($requestId:Int!){
                    vacation{
                        deleteVacationRequest(requestId:$requestId)
                    }
                }
            `,
            variables: {
                "requestId": Number(vacationRequest.id)
            }

        })
    }).pipe(
        map(res => {
            return res.response.data.vacation.deleteVacationRequest;
        })
    );
}

interface GraphQlCreateVacationRequest {
    data: {
        vacation: {
            createVacationRequest: string
        }
    }
}


export function RequestCreateVacationRequest(vacationRequest:InputVacationRequest){
    return ajax<GraphQlCreateVacationRequest>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
                mutation createVacationRequest($requesterId:Int!, $infoAboutRequest: String!, $startDate: DateTime!, $endDate: DateTime!){
                    vacation{
                        createVacationRequest(requesterId:$requesterId, infoAboutRequest: $infoAboutRequest, startDate: $startDate, endDate:$endDate )
                    }
                }
            `,
            variables: {
                "requesterId": Number(vacationRequest.requesterId),
                "infoAboutRequest": vacationRequest.infoAboutRequest,
                "startDate": vacationRequest.startDate.toISOString(),
                "endDate": vacationRequest.endDate.toISOString(),
            }

        })
    }).pipe(
        map(res => {
            return res.response.data.vacation.createVacationRequest;
        })
    );
}

