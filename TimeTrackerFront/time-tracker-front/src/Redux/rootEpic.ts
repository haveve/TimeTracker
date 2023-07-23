import { combineEpics, Epic } from "redux-observable";
import {
    deleteUserEpic,
    getUsersEpic,
    updateUserPermissionsEpic,
    setTimeEpic,
    getCurrentUserEpic,
    getPagedUsersEpic,
    getUsersBySearchEpic, getApproversEpic
} from "./epics";
import { catchError } from "rxjs";

export const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(
        getCurrentUserEpic,
        getUsersEpic,
        getPagedUsersEpic,
        getUsersBySearchEpic,
        updateUserPermissionsEpic,
        deleteUserEpic,
        //Time
        setTimeEpic,
        // Vacation
        getApproversEpic
    )(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            return source;
        })
    );