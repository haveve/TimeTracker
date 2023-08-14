import { combineEpics, Epic } from "redux-observable";
import {
    getUsersEpic,
    setTimeEpic,
    getCurrentUserEpic,
    getPagedUsersEpic,
    getUsersBySearchEpic,
    getApproversEpic,
    addApproverEpic,
    deleteApproverEpic,
    getVacationRequestsEpic,
    getApproversReaction,
    getApproversReactionEpic,
    cancelVacationRequestEpic,
    deleteVacationRequestEpic,
    createVacationRequestEpic, getIncomingVacationRequestsByApproverIdEpic, addApproverReactionEpic,
    setEndTimeEpic,
    setStartTimeEpic,
    getCurrentUserPermissionsEpic
} from "./epics";
import { catchError } from "rxjs";

export const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(
        getCurrentUserEpic,
        getCurrentUserPermissionsEpic,
        getUsersEpic,
        getPagedUsersEpic,
        getUsersBySearchEpic,
        //Time
        setTimeEpic,
        setEndTimeEpic,
        setStartTimeEpic,
        // Vacation
        getApproversEpic,
        addApproverEpic,
        deleteApproverEpic,
        getVacationRequestsEpic,
        getApproversReactionEpic,
        cancelVacationRequestEpic,
        deleteVacationRequestEpic,
        createVacationRequestEpic,
        getIncomingVacationRequestsByApproverIdEpic,
        addApproverReactionEpic
    )(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            return source;
        })
    );