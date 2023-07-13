import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { Permissions } from "../Types/Permissions";
import { getCookie } from "../../Login/Api/login-logout";
import { response } from "../Types/ResponseType";

interface GraphqlUsers {
    data: {
        users: User[]
    }
}
const url = "https://localhost:7226/graphql";

export function RequestUsers(): Observable<User[]> {
    return ajax<GraphqlUsers>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUsers{
                    users{
                        id
                        login
                        fullName
                      }
                  }
            `
        })
    }).pipe(
        map(res => {
            let users: User[] = res.response.data.users;
            return users;
        })
    );
}

interface GraphqlPermissions {
    data: {
        users: Permissions[]
    }
}

export function RequestUsersPermissions(): Observable<Permissions[]> {
    return ajax<GraphqlPermissions>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUsers{
                     users{
                        id
                        cRUDUsers
                        viewUsers
                        editWorkHours
                        editPermiters
                        importExcel
                        controlPresence
                        controlDayOffs
                      }
                  }
            `
        })
    }).pipe(
        map(res => {
            let permissions: Permissions[] = res.response.data.users;
            return permissions;
        })
    );
}

interface GraphqlUpdateUser {
    data: {
        updateUser: string
    }
}

export function RequestUpdateUser(user: User): Observable<string> {
    return ajax<GraphqlUpdateUser>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                mutation updateUser($id : Int!, $user: UserInputType!){
                    updateUser(id : $id, user: $user)
                  }
            `,
            variables: {
                "user": {
                    "login": user.login,
                    "fullName": user.fullName,
                    "password": user.password
                },
                "id": user.id
            }
        })
    }).pipe(
        map(res => {return res.response.data.updateUser})
    );
}


interface GraphqlUpdatePassword {
    data: {
        updateUserPassword: string
    }
}

export function RequestUpdatePassword(id: Number, NewPassword: string, Password : string): Observable<string> {
    return ajax<GraphqlUpdatePassword>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                mutation updateUserPassword($id : Int!, $Password: String!, $NewPassword: String!){
                    updateUserPassword(id : $id, password: $Password, newPassword: $NewPassword)
                  }
            `,
            variables: {
                "id": id,
                "Password": Password,
                "NewPassword": NewPassword
            }
        })
    }).pipe(
        map(res => {return res.response.data.updateUserPassword})
    );
}

export function RequestUpdateUserPermissions(permissions: Permissions): Observable<string> {
    return ajax<string>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                mutation  updateUserPermissions($PermissionsType : PermissionsType!){
                    updateUserPermissions(permissions : $PermissionsType)
                  }
            `,
            variables: {
                "PermissionsType": {
                    "id": permissions.id,
                    "cRUDUsers": permissions.cRUDUsers,
                    "editPermiters": permissions.editPermiters,
                    "viewUsers": permissions.viewUsers,
                    "editWorkHours": permissions.editWorkHours,
                    "importExcel": permissions.importExcel,
                    "controlPresence": permissions.controlPresence,
                    "controlDayOffs": permissions.controlDayOffs
                }
            }
        })
    }).pipe(
        map(res => res.response)
    );
}

export function RequestDeleteUser(id: number): Observable<string> {
    return ajax<string>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                mutation DeleteUser($id: Int!) {
                    deleteUser(id: $id)
                }
            `,
            variables: {
                "id": Number(id)
            }
        })
    }).pipe(
        map(res => res.response)
    );
}