import { map, Observable } from "rxjs";
import { Absence } from "../Types/Absence";
import { GetAjaxObservable } from "./TimeRequests";

interface GraphqlUserAbsences {
    absence: {
        userAbsences: Absence[]
    }
}

export function RequestUserAbsences(id: Number): Observable<Absence[]> {
    return GetAjaxObservable<GraphqlUserAbsences>(`
                query GetUserAbsences($Id: Int!){
                    absence{
                        userAbsences(id: $Id){
                          type,
                          date
                        }
                      }
                  }
            `,
        {
            "Id": id
        }
    ).pipe(
        map(res => {
            let abcenses: Absence[] = res.response.data.absence.userAbsences;
            return abcenses;
        })
    );
}

interface GraphqlCurrentUserAbsences {
    absence: {
        currentUserAbsences: Absence[]
    }
}

export function RequestCurrentUserAbsences(): Observable<Absence[]> {
    return GetAjaxObservable<GraphqlCurrentUserAbsences>(`
                query GetUserAbsences{
                    absence{
                        currentUserAbsences{
                          type,
                          date
                        }
                      }
                  }
            `, {}
    ).pipe(
        map(res => {
            let abcenses: Absence[] = res.response.data.absence.currentUserAbsences;
            return abcenses;
        })
    );
}

interface GraphqlAddUserAbsence {
    absence: {
        addUserAbsence: string
    }
}

export function RequestAddUserAbsence(absence: Absence): Observable<string> {
    return GetAjaxObservable<GraphqlAddUserAbsence>(`
            mutation addUserAbsence($Absence: AbsenceInput!){
                absence{
                    addUserAbsence(absence: $Absence)
                }
              }
            `, {
        "Absence": {
            "userId": absence.userId,
            "type": absence.type,
            "date": absence.date!.toISOString().slice(0, 10)
        }
    }).pipe(
        map(res => {
            return res.response.data.absence.addUserAbsence
        })
    );
}

interface GraphqlAddCurrentUserAbsence {
    absence: {
        addCurrentUserAbsence: string
    }
}

export function RequestAddCurrentUserAbsence(absence: Absence): Observable<string> {
    return GetAjaxObservable<GraphqlAddCurrentUserAbsence>(`
            mutation addCurrentUserAbsence($Absence: AbsenceInput!){
                absence{
                    addCurrentUserAbsence(absence: $Absence)
                }
              }
            `,
        {
            "Absence": {
                "userId": 0,
                "type": absence.type,
                "date": absence.date!.toISOString().slice(0, 10)
            },
        }).pipe(
            map(res => {
                return res.response.data.absence.addCurrentUserAbsence
            })
        );
}

interface GraphqlRemoveUserAbsence {
    absence: {
        removeUserAbsence: string
    }
}

export function RequestRemoveUserAbsence(absence: Absence): Observable<string> {
    return GetAjaxObservable<GraphqlRemoveUserAbsence>(`
            mutation removeUserAbsence($Absence: AbsenceInput!){
                absence{
                    removeUserAbsence(absence: $Absence)
                }
              }
            `,
        {
            "Absence": {
                "userId": absence.userId,
                "type": absence.type,
                "date": absence.date!
            },
        }
    ).pipe(
        map(res => {
            return res.response.data.absence.removeUserAbsence
        })
    );
}

interface GraphqlRemoveCurrentUserAbsence {
    absence: {
        removeCurrentUserAbsence: string
    }
}

export function RequestRemoveCurrentUserAbsence(absence: Absence): Observable<string> {
    return GetAjaxObservable<GraphqlRemoveCurrentUserAbsence>(`
            mutation removeCurrentUserAbsence($Absence: AbsenceInput!){
                absence{
                    removeCurrentUserAbsence(absence: $Absence)
                }
              }
            `,
        {
            "Absence": {
                "userId": 0,
                "type": absence.type,
                "date": absence.date!
            },
        }
    ).pipe(
        map(res => {
            return res.response.data.absence.removeCurrentUserAbsence
        })
    );
}
