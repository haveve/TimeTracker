import {combineEpics, Epic} from "redux-observable";
import { deleteUserEpic, getUsersPermissionsEpic, getUsersEpic, updateUserPermissionsEpic } from "./epics";
import {catchError} from "rxjs";

export const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(
        deleteUserEpic,
        getUsersEpic,
        getUsersPermissionsEpic,
        updateUserPermissionsEpic
    )(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            return source;
        })
    );