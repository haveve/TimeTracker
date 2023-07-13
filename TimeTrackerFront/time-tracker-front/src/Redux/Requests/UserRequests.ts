import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { Permissions } from "../Types/Permissions";
import { getCookie } from "../../Login/Api/login-logout";
import { number } from "yup";
import { Page } from "../Types/Page";
import { UsersPage } from "../Types/UsersPage";

interface GraphqlUsers {
    data: {
        user: {
            users: User[]
        }
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
                    user{
                        users{
                            id
                            login
                            fullName
                          }
                    }
                  }
            `
        })
    }).pipe(
        map(res => {
            let users: User[] = res.response.data.user.users;
            return users;
        })
    );
}

interface GraphqlPagedUsers {
    data: {
        user: {
            pagedUsers: {
                userList: User[],
                totalCount: number,
                pageIndex: number
            }
        }
    }
}

export function RequestPagedUsers(page: Page): Observable<UsersPage> {
    return ajax<GraphqlPagedUsers>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUsers($first: Int!, $after: Int!, $search: String, $orderfield: String, $order: String){
                    user{
                        pagedUsers(first: $first, after: $after, search: $search, orderfield: $orderfield, order: $order){
                            userList{
                                id
                                login
                                fullName
                              }
                              totalCount
                              pageIndex
                          }
                    }
                  }
            `,
            variables: {
                "first": page.first,
                "after": page.after,
                "search": page.search,
                "orderfield": page.orderfield,
                "order": page.order
            }

        })
    }).pipe(
        map(res => {
            let page: UsersPage = res.response.data.user.pagedUsers;
            return page;
        })
    );
}
interface GraphqlUser {
    data: {
        user: {
            user: User
        }
    }
}

export function RequestUser(Id: Number): Observable<User> {
    return ajax<GraphqlUser>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUser($Id: Int!){
                    user{
                        user(id: $Id){
                        id
                        login
                        fullName
                      }
                    }
                  }
            `,
            variables: {
                "Id": Number(Id)
            }
        })
    }).pipe(
        map(res => {
            {
                return res.response.data.user.user
            }
        })
    );
}

interface GraphqlPermissions {
    data: {
        user: {
            user: Permissions
        }
    }
}

export function RequestUserPermissions(Id: Number): Observable<Permissions> {
    return ajax<GraphqlPermissions>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUser($Id: Int!){
                    user{
                        user(id: $Id){
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
                  }
            `,
            variables: {
                "Id": Id
            }
        })
    }).pipe(
        map(res => {
            {
                return res.response.data.user.user
            }
        })
    );
}

interface GraphqlUpdateUser {
    data: {
        user:{
            updateUser: string
        }
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
                mutation updateUser($Id : Int!, $User: UserInputType!){
                    user{
                        updateUser(id : $Id, user: $User)
                    }
                  }
            `,
            variables: {
                "User": {
                    "login": user.login,
                    "fullName": user.fullName,
                    "password": user.password
                },
                "Id": Number(user.id)
            }
        })
    }).pipe(
        map(res => { return res.response.data.user.updateUser })
    );
}


interface GraphqlUpdatePassword {
    data: {
        user:{
            updateUserPassword: string
        }
    }
}

export function RequestUpdatePassword(id: Number, NewPassword: string, Password: string): Observable<string> {
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
                    user{
                        updateUserPassword(id : $id, password: $Password, newPassword: $NewPassword)
                    }
                  }
            `,
            variables: {
                "id": Number(id),
                "Password": Password,
                "NewPassword": NewPassword
            }
        })
    }).pipe(
        map(res => { return res.response.data.user.updateUserPassword })
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
                    user{
                        updateUserPermissions(permissions : $PermissionsType)
                    }
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
                    user{
                        deleteUser(id: $id)
                    }
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