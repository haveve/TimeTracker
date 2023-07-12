import { combineEpics, Epic } from "redux-observable";
import { deleteUserEpic, getUsersEpic, updateUserPermissionsEpic, setTimeEpic, getCurrentUserEpic } from "./epics";
import { catchError } from "rxjs";

export const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(
        getCurrentUserEpic,
        getUsersEpic,
        updateUserPermissionsEpic,
        deleteUserEpic,
        //Time
        setTimeEpic
    )(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            return source;
        })
    );