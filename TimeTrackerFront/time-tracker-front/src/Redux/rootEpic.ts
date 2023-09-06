import { combineEpics, Epic } from "redux-observable";
import {
    getUsersEpic,
    getCurrentUserEpic,
    getPagedUsersEpic,
    getUsersBySearchEpic,
    getCurrentUserPermissionsEpic
} from "./epics";
import {
    getApproversEpic,
    addApproverEpic,
    deleteApproverEpic,
    getVacationRequestsEpic,
    getApproversReactionEpic,
    cancelVacationRequestEpic,
    deleteVacationRequestEpic,
    createVacationRequestEpic, getIncomingVacationRequestsByApproverIdEpic, addApproverReactionEpic,
} from "./VacationEpics";
import {
    setTimeEpic,
    setEndTimeEpic,
    setStartTimeEpic,
    setIsStartedEpic
} from "./TimeEpics";
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
        setIsStartedEpic,
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