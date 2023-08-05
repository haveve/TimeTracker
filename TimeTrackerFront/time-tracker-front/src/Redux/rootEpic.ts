import { combineEpics, Epic } from "redux-observable";
import {
    deleteUserEpic,
    getUsersEpic,
    updateUserPermissionsEpic,
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
    setStartTimeEpic
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