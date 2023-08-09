import { ajax } from "rxjs/internal/ajax/ajax";
import { map, Observable } from "rxjs";
import { User } from "../Types/User";
import { Permissions } from "../Types/Permissions";
import { getCookie } from "../../Login/Api/login-logout";
import { response } from "../Types/ResponseType";
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
                            daySeconds
                            weekSeconds
                            monthSeconds
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

interface GraphqlUsersBySearch {
    data: {
        user: {
            usersBySearch: User[]
        }
    }
}

export function RequestUsersBySearch(search: String): Observable<User[]> {
    return ajax<GraphqlUsersBySearch>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUsersBySearch($search: String!){
                    user{
                        usersBySearch(name:$search){
                            id,
                            login,
                            fullName,
                            email
                          }
                    }
                  }
            `,
            variables: {
                "search": search
            }
        })
    }).pipe(
        map(res => {
            let users: User[] = res.response.data.user.usersBySearch;

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
                query GetUsers($first: Int!, $after: Int!, $search: String, $orderfield: String, $order: String, $enabled: String){
                    user{
                        pagedUsers(first: $first, after: $after, search: $search, orderfield: $orderfield, order: $order, enabled: $enabled){
                            userList{
                                id
                                login
                                fullName
                                daySeconds
                                weekSeconds
                                monthSeconds
                                timeManagedBy
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
                "order": page.order,
                "enabled": page.enabled
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
                        email
                        cRUDUsers
                        viewUsers
                        editWorkHours
                        editPermiters
                        importExcel
                        controlPresence
                        controlDayOffs
                        daySeconds
                        weekSeconds
                        monthSeconds
                        enabled
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

interface GraphqlCurrentUser {
    data: {
        user: {
            currentUser: User
        }
    }
}

export function RequestCurrentUser(): Observable<User> {
    return ajax<GraphqlCurrentUser>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetCurrentUser{
                    user{
                        currentUser{
                        id
                        login
                        fullName
                        email
                        daySeconds
                        weekSeconds
                        monthSeconds
                        enabled
                      }
                    }
                  }
            `
        })
    }).pipe(
        map(res => {
            {
                return res.response.data.user.currentUser
            }
        })
    );
}

interface GraphqlUserPermissions {
    data: {
        user: {
            userPermissions: Permissions
        }
    }
}

export function RequestUserPermissions(Id: Number): Observable<Permissions> {
    return ajax<GraphqlUserPermissions>({
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
                        userPermissions(id: $Id){
                        userId
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
                return res.response.data.user.userPermissions
            }
        })
    );
}

interface GraphqlCurrentUserPermissions {
    data: {
        user: {
            currentUserPermissions: Permissions
        }
    }
}

export function RequestCurrentUserPermissions(): Observable<Permissions> {
    return ajax<GraphqlCurrentUserPermissions>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetCurrentUserPermissions{
                    user{
                        currentUserPermissions{
                        userId
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
            `
        })
    }).pipe(
        map(res => {
            {
                return res.response.data.user.currentUserPermissions
            }
        })
    );
}

interface GraphqlRequestPasswordReset {
    data: {
        user: {
            RequestPasswordReset: string
        }
    }
}

export function RequestPasswordReset(LoginOrEmail: String): Observable<string> {
    return ajax<GraphqlRequestPasswordReset>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query sentResetPasswordEmail($LoginOrEmail: String!){
                    user{
                        sentResetPasswordEmail(loginOrEmail: $LoginOrEmail)
                    }
                  }
            `,
            variables: {
                "LoginOrEmail": LoginOrEmail
            }
        })
    }).pipe(
        map(res => {
            {
                return res.response.data.user.RequestPasswordReset;
            }
        })
    );
}

interface GraphqlCreateUser {
    data: {
        user: {
            createUser: string
        }
    }
}

export function RequestCreateUser(user: User, permissions: Permissions): Observable<string> {
    return ajax<GraphqlCreateUser>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                mutation createUser($User: UserInputType!, $Permissions: PermissionsInputType!){
                    user{
                        createUser(user: $User, permissions: $Permissions)
                    }
                  }
            `,
            variables: {
                "User": {
                    "login": user.login,
                    "fullName": user.fullName,
                    "password": user.password,
                    "email": user.email,
                    "workHours": user.workHours
                },
                "Permissions": {
                    "userId": permissions.userId,
                    "cRUDUsers": permissions.cRUDUsers,
                    "editPermiters": permissions.editPermiters,
                    "viewUsers": permissions.viewUsers,
                    "editWorkHours": permissions.editWorkHours,
                    "importExcel": permissions.importExcel,
                    "controlPresence": permissions.controlPresence,
                    "controlDayOffs": permissions.controlDayOffs,
                }
            }
        })
    }).pipe(
        map(res => { return res.response.data.user.createUser })
    );
}

interface GraphqlUpdateUser {
    data: {
        user: {
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
                    "password": user.password,
                    "email": user.email
                },
                "Id": Number(user.id)
            }
        })
    }).pipe(
        map(res => { return res.response.data.user.updateUser })
    );
}

interface GraphqlRequestRegisterUserByCode {
    data: {
        user: {
            registerUserByCode: string
        }
    }
}

export function RequestRegisterUserByCode(Password: string, Login: string, Code: string, Email: string): Observable<string> {
    return ajax<GraphqlRequestRegisterUserByCode>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                mutation registerUserByCode($Code : String!, $Email: String!, $Login : String!, $Password: String!){
                    user{
                        registerUserByCode(code : $Code, email: $Email, password: $Password, login: $Login)
                    }
                  }
            `,
            variables: {
                "Code": Code,
                "Email": Email,
                "Password": Password,
                "Login": Login
            }
        })
    }).pipe(
        map(res => { return res.response.data.user.registerUserByCode })
    );
}

interface GraphqlUpdatePasswordByCode {
    data: {
        user: {
            resetUserPasswordByCode: string
        }
    }
}

export function RequestUpdatePasswordByCode(NewPassword: string, Code: string, Email: string): Observable<string> {
    return ajax<GraphqlUpdatePasswordByCode>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                mutation resetUserPasswordByCode($Code : String!, $NewPassword: String!, $Email: String!){
                    user{
                        resetUserPasswordByCode(code : $Code, password: $NewPassword, email: $Email)
                    }
                  }
            `,
            variables: {
                "Code": Code,
                "NewPassword": NewPassword,
                "Email": Email,
            }
        })
    }).pipe(
        map(res => { return res.response.data.user.resetUserPasswordByCode })
    );
}
interface GraphqlUpdatePassword {
    data: {
        user: {
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
                mutation  updateUserPermissions($PermissionsType : PermissionsInputType!){
                    user{
                        updateUserPermissions(permissions : $PermissionsType)
                    }
                  }
            `,
            variables: {
                "PermissionsType": {
                    "userId": permissions.userId,
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

export function RequestDisableUser(id: number): Observable<string> {
    return ajax<string>({
        url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                mutation DisableUser($id: Int!) {
                    user{
                        disableUser(id: $id)
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