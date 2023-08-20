import {Epic, ofType} from "redux-observable";
import {map, mergeMap, Observable} from "rxjs";
import {
    RequestCurrentUser,
    RequestCurrentUserPermissions,
    RequestPagedUsers,
    RequestUsers,
    RequestUsersBySearch
} from "./Requests/UserRequests";
import {User} from "./Types/User";
import {getUsersList, getUsersListBySearch, getUsersPage} from "./Slices/UserSlice";
import {PayloadAction} from "@reduxjs/toolkit";
import {Page} from "./Types/Page";
import {UsersPage} from "./Types/UsersPage";
import {getTheCurrentPermissions, getTheCurrentUser} from "./Slices/CurrentUserSlice";
import {Permissions} from "./Types/Permissions";

export const ErrorMassagePattern = "There is occurred error from server. For details check console and turn to administrator ";

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

export const getCurrentUserPermissions = () => ({ type: "getCurrentUserPermissions" });
export const getCurrentUserPermissionsEpic: Epic = action$ => action$.pipe(
    ofType("getCurrentUserPermissions"),
    mergeMap(() => RequestCurrentUserPermissions().pipe(
        map((res: Permissions) => getTheCurrentPermissions(res))
    ))
);