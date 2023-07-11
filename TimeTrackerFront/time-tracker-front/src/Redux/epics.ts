import {Epic, ofType} from "redux-observable";
import {map, mergeMap, Observable, of} from "rxjs";
import { RequestDeleteUser, RequestUsers, RequestUsersPermissions, RequestUpdateUserPermissions, RequestUpdateUser } from "./Requests/UserRequests";
import { User } from "./Types/User";
import { Permissions } from "./Types/Permissions";
import {PayloadAction} from "@reduxjs/toolkit";
import { getUsersList, getPermissions } from "./Slices/UserSlice";
import { RequestGetTime } from "./Requests/TimeRequests";
import { Time } from "./Types/Time";
import {setTime} from "./Slices/TimeSlice"

export const getUsers = () => ({ type: "getUsers"});
export const getUsersEpic: Epic = action$ => action$.pipe(
    ofType("getUsers"),
    mergeMap(() => RequestUsers().pipe(
        map((res: User[]) => getUsersList(res))
    ))
);

export const getUsersPermissions = () => ({ type: "getUsersPermissions"});
export const getUsersPermissionsEpic: Epic = action$ => action$.pipe(
    ofType("getUsersPermissions"),
    mergeMap(() => RequestUsersPermissions().pipe(
        map((res: Permissions[]) => getPermissions(res))
    ))
);

// export const updateUser = (user: User) => ({type: "updateUser", payload: user});
// export const updateUserEpic: Epic = (action$: Observable<PayloadAction<User>>) => action$.pipe(
//     ofType("updateUser"),
//     map(action => action.payload),
//     mergeMap((user) => RequestUpdateUser(user).pipe(
//         map(() => getUsers())
//     ))
// );

export const updateUserPermissions = (permissions: Permissions) => ({type: "updateUserPermissions", payload: permissions});
export const updateUserPermissionsEpic: Epic = (action$: Observable<PayloadAction<Permissions>>) => action$.pipe(
    ofType("updateUserPermissions"),
    map(action => action.payload),
    mergeMap((permissions) => RequestUpdateUserPermissions(permissions).pipe(
        map(() => getUsersPermissions())
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