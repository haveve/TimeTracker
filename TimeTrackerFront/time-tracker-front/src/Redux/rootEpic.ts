import { combineEpics, Epic } from "redux-observable";
import { deleteUserEpic, getUsersEpic, updateUserPermissionsEpic, setTimeEpic } from "./epics";
import { catchError } from "rxjs";

export const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(
        deleteUserEpic,
        getUsersEpic,
        updateUserPermissionsEpic,
        //Time
        setTimeEpic
    )(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            return source;
        })
    );