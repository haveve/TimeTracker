import { Epic, ofType } from "redux-observable";
import { catchError, map, mergeMap, Observable, of } from "rxjs";
import {
    RequestUsers,
    RequestUpdateUserPermissions,
    RequestUpdateUser,
    RequestUser,
    RequestPagedUsers,
    RequestUsersBySearch,
    RequestCurrentUser
} from "./Requests/UserRequests";
import {User} from "./Types/User";
import {Permissions} from "./Types/Permissions";
import {PayloadAction} from "@reduxjs/toolkit";
import {getUsersPage, getUsersList, getUsersListBySearch} from "./Slices/UserSlice";
import {getTheCurrentUser} from "./Slices/CurrentUserSlice";
import {RequestGetTime,RequestSetStartDate,RequestSetEndDate} from "./Requests/TimeRequests";
import {Time, TimeResponse, TimeRequest,TimeMark} from "./Types/Time";
import {setTime, setErrorStatusAndError as setErrorStatusAndErrorTime, setStartTime,setEndTime} from "./Slices/TimeSlice"
import {setErrorStatusAndError as setErrorStatusAndErrorUserList} from "./Slices/UserSlice";
import {Page} from "./Types/Page";
import {UsersPage} from "./Types/UsersPage";
import {RequestUpdateDate} from "./Requests/TimeRequests";
import {
    RequestAddApprover, RequestAddApproverReaction,
    RequestApprovers, RequestApproversReaction, RequestCancelVacationRequest, RequestCreateVacationRequest,
    RequestDeleteApprover, RequestDeleteVacationRequest, RequestIncomingVacationRequestsByApproverId,
    RequestVacationRequestsByRequesterId
} from "./Requests/VacationRequests";
import {
    getApproversList,
    getApproversReactionList,
    getIncomingVacationRequestsListByApproverId,
    getVacationRequestsListByRequesterId
} from "./Slices/VacationSlice";
import {ApproverNode} from "./Types/ApproverNode";
import {VacationRequest} from "./Types/VacationRequest";
import {InputVacationRequest} from "./Types/InputVacationRequest";
import {InputApproverReaction} from "./Types/InputApproverReaction";

export const ErrorMassagePattern = "There is occured error from server. For details check console and turn to administrator ";

export const getUsers = () => ({ type: "getUsers" });
export const getUsersEpic: Epic = action$ => action$.pipe(
    ofType("getUsers"),
    mergeMap(() => RequestUsers().pipe(
        map((res: User[]) => getUsersList(res))
    ))
);

export const getUsersBySearch = (search: String) => ({ type: "getUsersBySearch", payload: search });
export const getUsersBySearchEpic: Epic = (action$: Observable<PayloadAction<String>>) => action$.pipe(
    ofType("getUsersBySearch"),
    map(action => action.payload),
    mergeMap((search) => RequestUsersBySearch(search).pipe(
        map((res: User[]) => getUsersListBySearch(res))
    ))
)

export const getPagedUsers = (page: Page) => ({ type: "getPagedUsers", payload: page });
export const getPagedUsersEpic: Epic = (action$: Observable<PayloadAction<Page>>) => action$.pipe(
    ofType("getPagedUsers"),
    map(action => action.payload),
    mergeMap((page) => RequestPagedUsers(page).pipe(
        map((res: UsersPage) => getUsersPage(res))
    ))
);

export const getCurrentUser = () => ({ type: "getCurrentUser"});
export const getCurrentUserEpic: Epic = (action$: Observable<PayloadAction<number>>) => action$.pipe(
    ofType("getCurrentUser"),
    mergeMap(() => RequestCurrentUser().pipe(
        map((res: User) => getTheCurrentUser(res))
    ))
);

//TimeSlice


export interface TimePayloadType{
    timeMark:TimeMark[],
    pageNumber:number,
    itemsInPage:number,
    offset:number
}

export const setTimeE = (timeMark:TimeMark[],pageNumber:number,itemsInPage:number,offset:number) => ({type: "setTime",payload:{
    timeMark,pageNumber,itemsInPage,offset
}})
export const setTimeEpic: Epic = (action$:Observable<PayloadAction<TimePayloadType>>)=> {

    return action$.pipe(
        ofType("setTime"),
        map(a=>a.payload),
        mergeMap((p) => RequestGetTime(p.timeMark,p.pageNumber,p.itemsInPage,p.offset).pipe(
            map((res: TimeResponse) => setTime(res)),
            catchError(() => of(setErrorStatusAndErrorTime(ErrorMassagePattern)))
        )),
    )
};

export const setStartTimeE = (offset:number) => ({type: "setStartTime",payload:offset})
export const setStartTimeEpic: Epic = (action$:Observable<PayloadAction<number>>)=> {
    return action$.pipe(
        ofType("setStartTime"),
        map(a=>a.payload),
        mergeMap((offset) => RequestSetStartDate(offset).pipe(
            map((res) => setStartTime(res)),
            catchError(() => of(setErrorStatusAndErrorTime(ErrorMassagePattern)))
        )),
    )
};


export const setEndTimeE = (offset:number) => ({type: "setEndTime",payload:offset})
export const setEndTimeEpic: Epic = (action$:Observable<PayloadAction<number>>)=> {
    return action$.pipe(
        ofType("setEndTime"),
        map(a=>a.payload),
        mergeMap((offset) => RequestSetEndDate(offset).pipe(
            map((res) => setEndTime(res)),
            catchError(() => of(setErrorStatusAndErrorTime(ErrorMassagePattern)))
        )),
    )
};

// VacationSlice

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
        map(() => getApprovers(approverNode.requesterId))
    ))
);

export const deleteApprover = (approverNode: ApproverNode) =>
    ({ type: "deleteApprover", payload: approverNode });
export const deleteApproverEpic: Epic = (action$: Observable<PayloadAction<ApproverNode>>) => action$.pipe(
    ofType("deleteApprover"),
    map(action => action.payload),
    mergeMap((approverNode) => RequestDeleteApprover(approverNode).pipe(
        map(() => getApprovers(approverNode.requesterId))
    ))
);

export const getVacationRequestsByRequesterId = (requesterId: number) =>
    ({type: "getVacationRequestsByRequesterId", payload: requesterId});
export const getVacationRequestsEpic: Epic = (action$: Observable<PayloadAction<number>>) => action$.pipe(
    ofType("getVacationRequestsByRequesterId"),
    map(action => action.payload),
    mergeMap((requesterId) => RequestVacationRequestsByRequesterId(requesterId).pipe(
        map((res: VacationRequest[]) => getVacationRequestsListByRequesterId(res))
    ))
)

export const getIncomingVacationRequestsByApproverId = (approverId: number) =>
    ({type: "getIncomingVacationRequestsByApproverId", payload: approverId});
export const getIncomingVacationRequestsByApproverIdEpic: Epic = (action$: Observable<PayloadAction<number>>) => action$.pipe(
    ofType("getIncomingVacationRequestsByApproverId"),
    map(action => action.payload),
    mergeMap((approverId) => RequestIncomingVacationRequestsByApproverId(approverId).pipe(
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
        map(() => getIncomingVacationRequestsByApproverId(inputApproverReaction.approverId))
    ))
)

export const createVacationRequest = (vacationRequest: InputVacationRequest)=>
    ({type: "createVacationRequest", payload: vacationRequest});
export const createVacationRequestEpic: Epic = (action$: Observable<PayloadAction<InputVacationRequest>>) => action$.pipe(
    ofType("createVacationRequest"),
    map(action => action.payload),
    mergeMap((vacationRequest) => RequestCreateVacationRequest(vacationRequest).pipe(
        map(() => getVacationRequestsByRequesterId(vacationRequest.requesterId))
    ))
);
export const cancelVacationRequest = (vacationRequest: VacationRequest)=>
    ({type: "cancelVacationRequest", payload: vacationRequest});
export const cancelVacationRequestEpic: Epic = (action$: Observable<PayloadAction<VacationRequest>>) => action$.pipe(
    ofType("cancelVacationRequest"),
    map(action => action.payload),
    mergeMap((vacationRequest) => RequestCancelVacationRequest(vacationRequest).pipe(
        map(() => getVacationRequestsByRequesterId(vacationRequest.requesterId))
    ))
);

export const deleteVacationRequest = (vacationRequest: VacationRequest)=>
    ({type: "deleteVacationRequest", payload: vacationRequest});
export const deleteVacationRequestEpic: Epic = (action$: Observable<PayloadAction<VacationRequest>>) => action$.pipe(
    ofType("deleteVacationRequest"),
    map(action => action.payload),
    mergeMap((vacationRequest) => RequestDeleteVacationRequest(vacationRequest).pipe(
        map(() => getVacationRequestsByRequesterId(vacationRequest.requesterId))
    ))
);