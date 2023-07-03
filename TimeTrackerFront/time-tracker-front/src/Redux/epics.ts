import {Epic, ofType} from "redux-observable";
import {catchError, delay, map, mergeMap, Observable, of} from "rxjs";
import { RequestDeleteUser, RequestUsers } from "./Requests/UserRequests";
import { User } from "./Types/User";
import {PayloadAction} from "@reduxjs/toolkit";
import { getUsersList } from "./Slices/UserSlice";

export const getUsers = () => ({ type: "getUsers"});
export const getUsersEpic: Epic = action$ => action$.pipe(
    ofType("getUsers"),
    mergeMap(() => RequestUsers().pipe(
        map((res: User[]) => getUsersList(res))
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