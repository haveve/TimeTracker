import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { Permissions } from "../Types/Permissions";
import { getCookie } from "../../Login/Api/login-logout";
import { response } from "../Types/ResponseType";
import { number } from "yup";
import { Page } from "../Types/Page";
import { UsersPage } from "../Types/UsersPage";
import { Absence } from "../Types/Absence";

const url = "https://localhost:7226/graphql";

interface GraphqlUserAbsences {
    data: {
        absence: {
            userAbsences: Absence[]
        }
    }
}

export function RequestUserAbsences(id: Number): Observable<Absence[]> {
    return ajax<GraphqlUserAbsences>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUserAbsences($Id: Int!){
                    absence{
                        userAbsences(id: $Id){
                          type,
                          date
                        }
                      }
                  }
            `,
            variables: {
                "Id": id
            }
        })
    }).pipe(
        map(res => {
            let abcenses: Absence[] = res.response.data.absence.userAbsences;
            return abcenses;
        })
    );
}
interface GraphqlCurrentUserAbsences {
    data: {
        absence: {
            currentUserAbsences: Absence[]
        }
    }
}

export function RequestCurrentUserAbsences(): Observable<Absence[]> {
    return ajax<GraphqlCurrentUserAbsences>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUserAbsences{
                    absence{
                        currentUserAbsences{
                          type,
                          date
                        }
                      }
                  }
            `
        })
    }).pipe(
        map(res => {
            let abcenses: Absence[] = res.response.data.absence.currentUserAbsences;
            return abcenses;
        })
    );
}

interface GraphqlAddUserAbsence {
    data: {
        absence: {
            addUserAbsence: string
        }
    }
}

export function RequestAddUserAbsence(absence: Absence): Observable<string> {
    return ajax<GraphqlAddUserAbsence>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation addUserAbsence($Absence: AbsenceInputType!){
                absence{
                    addUserAbsence(absence: $Absence)
                }
              }
            `,
            variables: {
                "Absence": {
                    "userId": absence.userId,
                    "type": absence.type,
                    "date": absence.date!.toISOString().slice(0, 10)
                },
            }
        })
    }).pipe(
        map(res => { return res.response.data.absence.addUserAbsence })
    );
}

interface GraphqlAddCurrentUserAbsence {
    data: {
        absence: {
            addCurrentUserAbsence: string
        }
    }
}

export function RequestAddCurrentUserAbsence(absence: Absence): Observable<string> {
    return ajax<GraphqlAddCurrentUserAbsence>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation addCurrentUserAbsence($Absence: AbsenceInputType!){
                absence{
                    addCurrentUserAbsence(absence: $Absence)
                }
              }
            `,
            variables: {
                "Absence": {
                    "userId": 0,
                    "type": absence.type,
                    "date": absence.date!.toISOString().slice(0, 10)
                },
            }
        })
    }).pipe(
        map(res => { return res.response.data.absence.addCurrentUserAbsence })
    );
}

interface GraphqlRemoveUserAbsence {
    data: {
        absence: {
            removeUserAbsence: string
        }
    }
}

export function RequestRemoveUserAbsence(absence: Absence): Observable<string> {
    return ajax<GraphqlRemoveUserAbsence>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation removeUserAbsence($Absence: AbsenceInputType!){
                absence{
                    removeUserAbsence(absence: $Absence)
                }
              }
            `,
            variables: {
                "Absence": {
                    "userId": absence.userId,
                    "type": absence.type,
                    "date": absence.date!
                },
            }
        })
    }).pipe(
        map(res => { return res.response.data.absence.removeUserAbsence })
    );
}

interface GraphqlRemoveCurrentUserAbsence {
    data: {
        absence: {
            removeCurrentUserAbsence: string
        }
    }
}

export function RequestRemoveCurrentUserAbsence(absence: Absence): Observable<string> {
    return ajax<GraphqlRemoveCurrentUserAbsence>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
            mutation removeCurrentUserAbsence($Absence: AbsenceInputType!){
                absence{
                    removeCurrentUserAbsence(absence: $Absence)
                }
              }
            `,
            variables: {
                "Absence": {
                    "userId": 0,
                    "type": absence.type,
                    "date": absence.date!
                },
            }
        })
    }).pipe(
        map(res => { return res.response.data.absence.removeCurrentUserAbsence })
    );
}
