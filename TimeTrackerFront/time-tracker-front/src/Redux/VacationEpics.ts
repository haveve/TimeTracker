import {Epic, ofType} from "redux-observable";
import {map, mergeMap, Observable} from "rxjs";
import {PayloadAction} from "@reduxjs/toolkit";
import {
    RequestAddApprover, RequestAddApproverReaction,
    RequestApprovers, RequestApproversReaction, RequestCancelVacationRequest, RequestCreateVacationRequest,
    RequestDeleteApprover, RequestDeleteVacationRequest, RequestIncomingVacationRequestsByApproverId,
    RequestVacationRequestsByRequesterId
} from "./Requests/VacationRequests";
import {User} from "./Types/User";
import {
    getApproversList, getApproversReactionList,
    getIncomingVacationRequestsListByApproverId,
    getVacationRequestsListByRequesterId
} from "./Slices/VacationSlice";
import {ApproverNode} from "./Types/ApproverNode";
import {InputVacRequest} from "./Types/InputVacRequest";
import {VacationRequest} from "./Types/VacationRequest";
import {InputApproverReaction} from "./Types/InputApproverReaction";
import {InputVacationRequest} from "./Types/InputVacationRequest";

export const getApprovers = (requesterId: number) =>
    ({ type: "getApprovers", payload: requesterId });
export const getApproversEpic: Epic = (action$: Observable<PayloadAction<number>>) => action$.pipe(
    ofType("getApprovers"),
    map(action => action.payload),
    mergeMap((requesterId) => RequestApprovers(requesterId).pipe(
        map((res: User[]) => getApproversList(res))
    ))
)

export const addApprover = (approverNode: ApproverNode) =>
    ({ type: "addApprover", payload: approverNode });
export const addApproverEpic: Epic = (action$: Observable<PayloadAction<ApproverNode>>) => action$.pipe(
    ofType("addApprover"),
    map(action => action.payload),
    mergeMap((approverNode) => RequestAddApprover(approverNode).pipe(
        map(() => getApprovers(approverNode.userIdRequester))
    ))
);

export const deleteApprover = (approverNode: ApproverNode) =>
    ({ type: "deleteApprover", payload: approverNode });
export const deleteApproverEpic: Epic = (action$: Observable<PayloadAction<ApproverNode>>) => action$.pipe(
    ofType("deleteApprover"),
    map(action => action.payload),
    mergeMap((approverNode) => RequestDeleteApprover(approverNode).pipe(
        map(() => getApprovers(approverNode.userIdRequester))
    ))
);

export const getVacationRequestsByRequesterId = (inputVacRequest: InputVacRequest) =>
    ({type: "getVacationRequestsByRequesterId", payload: inputVacRequest});
export const getVacationRequestsEpic: Epic = (action$: Observable<PayloadAction<InputVacRequest>>) => action$.pipe(
    ofType("getVacationRequestsByRequesterId"),
    map(action => action.payload),
    mergeMap((inputVacRequest) => RequestVacationRequestsByRequesterId(inputVacRequest).pipe(
        map((res: VacationRequest[]) => getVacationRequestsListByRequesterId(res))
    ))
)

export const getIncomingVacationRequestsByApproverId = (inputVacRequest: InputVacRequest) =>
    ({type: "getIncomingVacationRequestsByApproverId", payload: inputVacRequest});
export const getIncomingVacationRequestsByApproverIdEpic: Epic = (action$: Observable<PayloadAction<InputVacRequest>>) => action$.pipe(
    ofType("getIncomingVacationRequestsByApproverId"),
    map(action => action.payload),
    mergeMap((inputVacRequest) => RequestIncomingVacationRequestsByApproverId(inputVacRequest).pipe(
        map((res: VacationRequest[]) => getIncomingVacationRequestsListByApproverId(res))
    ))
)

export const getApproversReaction = (requestId: number) =>
    ({type: "getApproversReaction", payload: requestId});
export const getApproversReactionEpic: Epic = (action$: Observable<PayloadAction<number>>) => action$.pipe(
    ofType("getApproversReaction"),
    map(action => action.payload),
    mergeMap((requestId) => RequestApproversReaction(requestId).pipe(
        map((res: ApproverNode[]) => getApproversReactionList(res))
    ))
)

export const addApproverReaction = (InputApproverReaction: InputApproverReaction) =>
    ({type: "addApproverReaction", payload: InputApproverReaction});
export const addApproverReactionEpic: Epic = (action$: Observable<PayloadAction<InputApproverReaction>>) => action$.pipe(
    ofType("addApproverReaction"),
    map(action => action.payload),
    mergeMap((inputApproverReaction) => RequestAddApproverReaction(inputApproverReaction).pipe(
        map(() => getIncomingVacationRequestsByApproverId(
            {approverOrRequesterId: inputApproverReaction.approverId, requestStatus: "Pending"}
        ))
    ))
)

export const createVacationRequest = (vacationRequest: InputVacationRequest)=>
    ({type: "createVacationRequest", payload: vacationRequest});
export const createVacationRequestEpic: Epic = (action$: Observable<PayloadAction<InputVacationRequest>>) => action$.pipe(
    ofType("createVacationRequest"),
    map(action => action.payload),
    mergeMap((vacationRequest) => RequestCreateVacationRequest(vacationRequest).pipe(
        map(() => getVacationRequestsByRequesterId(
            {approverOrRequesterId: vacationRequest.requesterId, requestStatus: "Pending"}
        ))
    ))
);
export const cancelVacationRequest = (vacationRequest: VacationRequest)=>
    ({type: "cancelVacationRequest", payload: vacationRequest});
export const cancelVacationRequestEpic: Epic = (action$: Observable<PayloadAction<VacationRequest>>) => action$.pipe(
    ofType("cancelVacationRequest"),
    map(action => action.payload),
    mergeMap((vacationRequest) => RequestCancelVacationRequest(vacationRequest).pipe(
        map(() => getVacationRequestsByRequesterId(
            {approverOrRequesterId: vacationRequest.requesterId, requestStatus: "All"}
        ))
    ))
);

export const deleteVacationRequest = (vacationRequest: VacationRequest)=>
    ({type: "deleteVacationRequest", payload: vacationRequest});
export const deleteVacationRequestEpic: Epic = (action$: Observable<PayloadAction<VacationRequest>>) => action$.pipe(
    ofType("deleteVacationRequest"),
    map(action => action.payload),
    mergeMap((vacationRequest) => RequestDeleteVacationRequest(vacationRequest).pipe(
        map(() => getVacationRequestsByRequesterId(
            {approverOrRequesterId: vacationRequest.requesterId,requestStatus: "Pending"}
        ))

    ))
);