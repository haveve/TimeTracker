import { combineEpics, Epic } from "redux-observable";
import { deleteUserEpic, getUsersPermissionsEpic, getUsersEpic, updateUserPermissionsEpic, plusOneSecondEpic, setTimeEpic } from "./epics";
import { catchError } from "rxjs";

export const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(
        deleteUserEpic,
        getUsersEpic,
        getUsersPermissionsEpic,
        updateUserPermissionsEpic,
        //Time
        plusOneSecondEpic,
        setTimeEpic
    )(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            return source;
        })
    );