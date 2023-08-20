import { User } from "../Types/User";
import { map, Observable } from "rxjs";
import { ajax } from "rxjs/ajax";
import { ApproverNode } from "../Types/ApproverNode";
import { GetAjaxObservable } from "./TimeRequests";
import { TimeRequest } from "../Types/Time";
import App from "../../App";
import { VacationRequest } from "../Types/VacationRequest";
import { vacationState } from "../Slices/VacationSlice";
import { InputVacationRequest } from "../Types/InputVacationRequest";
import { InputApproverReaction } from "../Types/InputApproverReaction";
import { InputVacRequest } from "../Types/InputVacRequest";

const url = "https://localhost:7226/graphql";

interface GraphQlUsers {
    vacation: {
        approvers: User[]
    }
}

export function RequestApprovers(requesterId: Number): Observable<User[]> {
    return GetAjaxObservable<GraphQlUsers>(`
                query GetApprovers($requesterId:Int!){
                    vacation{
                        approvers(requesterId: $requesterId){
                            id, login, fullName, email
                        }
                    }
                }
            `,
        {
            "requesterId": Number(requesterId)
        }

    ).pipe(
        map(res => {
            return res.response.data.vacation.approvers;
        })
    );
}

interface GraphQlAddApprover {
    vacation: {
        addApproverForUser: string;
    }
}

export function RequestAddApprover(approverNode: ApproverNode): Observable<string> {
    return GetAjaxObservable<GraphQlAddApprover>(`
                mutation addApproverForUser($approverId:Int!,$requesterId:Int!){
                    vacation{
                        addApproverForUser(approverUserId: $approverId, requesterUserId: $requesterId)
                    }
                }
            `,
        {
            "approverId": Number(approverNode.userIdApprover),
            "requesterId": Number(approverNode.userIdRequester)
        }
    ).pipe(
        map(res => {

            return res.response.data.vacation.addApproverForUser;
        })
    );
}


interface GraphQlDeleteApprover {
    vacation: {
        deleteApprover: string;
    }
}

export function RequestDeleteApprover(approverNode: ApproverNode): Observable<string> {
    return GetAjaxObservable<GraphQlDeleteApprover>(`
                mutation deleteApprover($approverId:Int!,$requesterId:Int!){
                    vacation{
                        deleteApprover(approverUserId: $approverId, requesterUserId: $requesterId)
                    }
                }
            `,
        {
            "approverId": Number(approverNode.userIdApprover),
            "requesterId": Number(approverNode.userIdRequester)
        }
    ).pipe(
        map(res => {

            return res.response.data.vacation.deleteApprover;
        })
    );
}

interface GraphQlVacationRequests {
    vacation: {
        vacationRequest: VacationRequest[]
    }
}

export function RequestVacationRequestsByRequesterId(inputVacRequest: InputVacRequest): Observable<VacationRequest[]> {
    return GetAjaxObservable<GraphQlVacationRequests>(`
                query vacationRequest($requesterId:Int!, $requestStatus:String!){
                    vacation{
                        vacationRequest(requesterId:$requesterId, requestStatus:$requestStatus){
                            id, requesterId, infoAboutRequest, status, startDate, endDate
                        }
                    }
                }
            `,
        {
            "requesterId": Number(inputVacRequest.approverOrRequesterId),
            "requestStatus": String(inputVacRequest.requestStatus)
        }
    ).pipe(
        map(res => {
            return res.response.data.vacation.vacationRequest;
        })
    );
}


interface GraphQlIncomingVacationRequests {
    vacation: {
        vacationRequest: VacationRequest[]
    }
}

export function RequestIncomingVacationRequestsByApproverId(inputVacRequest: InputVacRequest): Observable<VacationRequest[]> {
    return GetAjaxObservable<GraphQlIncomingVacationRequests>(`
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
        {
            "approverId": Number(inputVacRequest.approverOrRequesterId),
            "requestStatus": String(inputVacRequest.requestStatus)

        }).pipe(
            map(res => {

                return res.response.data.vacation.vacationRequest;
            })
        );
}

interface GraphQlApproverNodes {
    vacation: {
        approversReaction: ApproverNode[]
    }
}

export function RequestApproversReaction(requestId: Number): Observable<ApproverNode[]> {
    return GetAjaxObservable<GraphQlApproverNodes>(`
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
        {
            "requestId": Number(requestId)
        }).pipe(
            map(res => {
                return res.response.data.vacation.approversReaction;
            })
        );
}

interface GraphQlAddApproverReaction {
    vacation: {
        addApproverReaction: string
    }
}


export function RequestAddApproverReaction(inputApproverReaction: InputApproverReaction) {
    return GetAjaxObservable<GraphQlAddApproverReaction>(`
                mutation addApproverReaction($approverUserId:Int!,$requestId:Int!,$reaction: Boolean!, $reactionMessage: String!){
                    vacation{
                        addApproverReaction(approverUserId: $approverUserId, requestId: $requestId, reaction: $reaction, reactionMessage:$reactionMessage)
                    }
                }
            `,
        {
            "approverUserId": Number(inputApproverReaction.approverId),
            "requestId": Number(inputApproverReaction.requestId),
            "reaction": Boolean(inputApproverReaction.reaction),
            "reactionMessage": String(inputApproverReaction.reactionMessage),
        }).pipe(
            map(res => {

                return res.response.data.vacation.addApproverReaction;
            })
        );
}




interface GraphQlCancelVacationRequest {
    vacation: {
        cancelVacationRequest: string
    }
}


export function RequestCancelVacationRequest(vacationRequest: VacationRequest) {
    return GetAjaxObservable<GraphQlCancelVacationRequest>(`
                mutation cancelVacationRequest($requestId:Int!){
                    vacation{
                        cancelVacationRequest(requestId:$requestId)
                    }
                }
            `,
        {
            "requestId": Number(vacationRequest.id)
        }).pipe(
            map(res => {

                return res.response.data.vacation.cancelVacationRequest;
            })
        );
}

interface GraphQlDeleteVacationRequest {
    vacation: {
        deleteVacationRequest: string
    }
}


export function RequestDeleteVacationRequest(vacationRequest: VacationRequest) {
    return GetAjaxObservable<GraphQlDeleteVacationRequest>(`
                mutation deleteVacationRequest($requestId:Int!){
                    vacation{
                        deleteVacationRequest(requestId:$requestId)
                    }
                }
            `,
        {
            "requestId": Number(vacationRequest.id)
        }).pipe(
            map(res => {
                return res.response.data.vacation.deleteVacationRequest;
            })
        );
}

interface GraphQlCreateVacationRequest {
    vacation: {
        createVacationRequest: string
    }
}


export function RequestCreateVacationRequest(vacationRequest: InputVacationRequest) {
    return GetAjaxObservable<GraphQlCreateVacationRequest>(`
                mutation createVacationRequest($requesterId:Int!, $infoAboutRequest: String!, $startDate: DateTime!, $endDate: DateTime!){
                    vacation{
                        createVacationRequest(requesterId:$requesterId, infoAboutRequest: $infoAboutRequest, startDate: $startDate, endDate:$endDate )
                    }
                }
            `,
        {
            "requesterId": Number(vacationRequest.requesterId),
            "infoAboutRequest": vacationRequest.infoAboutRequest,
            "startDate": vacationRequest.startDate.toISOString(),
            "endDate": vacationRequest.endDate.toISOString(),
        }).pipe(
            map(res => {
                return res.response.data.vacation.createVacationRequest;
            })
        );
}

