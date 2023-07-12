import {Epic, ofType} from "redux-observable";
import {map, mergeMap, Observable, of} from "rxjs";
import { RequestDeleteUser, RequestUsers, RequestUpdateUserPermissions, RequestUpdateUser, RequestUser, RequestPagedUsers } from "./Requests/UserRequests";
import { User } from "./Types/User";
import { Permissions } from "./Types/Permissions";
import {PayloadAction} from "@reduxjs/toolkit";
import { getUsersPage, getUsersList } from "./Slices/UserSlice";
import { getTheCurrentUser } from "./Slices/CurrentUserSlice";
import { RequestGetTime } from "./Requests/TimeRequests";
import { Time } from "./Types/Time";
import {setTime} from "./Slices/TimeSlice"
import { Page } from "./Types/Page";
import { UsersPage } from "./Types/UsersPage";

export const getUsers = () => ({ type: "getUsers"});
export const getUsersEpic: Epic = action$ => action$.pipe(
    ofType("getUsers"),
    mergeMap(() => RequestUsers().pipe(
        map((res: User[]) => getUsersList(res))
    ))
);

export const getPagedUsers = (page: Page) => ({ type: "getPagedUsers", payload: page});
export const getPagedUsersEpic: Epic = (action$: Observable<PayloadAction<Page>>) => action$.pipe(
    ofType("getPagedUsers"),
    map(action => action.payload),
    mergeMap((page) => RequestPagedUsers(page).pipe(
        map((res: UsersPage) => getUsersPage(res))
    ))
);

export const getCurrentUser = (id: number) => ({ type: "getCurrentUser", payload: id});
export const getCurrentUserEpic: Epic = (action$: Observable<PayloadAction<number>>) => action$.pipe(
    ofType("getCurrentUser"),
    map(action => action.payload),
    mergeMap((id) => RequestUser(id).pipe(
        map((res: User) => getTheCurrentUser(res))
    ))
);

export const updateUserPermissions = (permissions: Permissions) => ({type: "updateUserPermissions", payload: permissions});
export const updateUserPermissionsEpic: Epic = (action$: Observable<PayloadAction<Permissions>>) => action$.pipe(
    ofType("updateUserPermissions"),
    map(action => action.payload),
    mergeMap((permissions) => RequestUpdateUserPermissions(permissions).pipe(
        map(() => getUsers())
    ))
);

export const deleteUser = (id: number) => ({type: "deleteUser", payload: id});
export const deleteUserEpic: Epic = (action$: Observable<PayloadAction<number>>) => action$.pipe(
    ofType("deleteUser"),
    map(action => action.payload),
    mergeMap((id) => RequestDeleteUser(id).pipe(
        map(() => getUsers())
    ))
);

//TimeSlice

export const setTimeE = ()=>({ type:"setTime"})
export const setTimeEpic: Epic = action$ =>{ 
    return action$.pipe(
    ofType("setTime"),
    mergeMap(() => RequestGetTime().pipe(
        map((res:Time)=>setTime(res))
    ))
)};