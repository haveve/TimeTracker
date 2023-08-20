import {ajax} from "rxjs/internal/ajax/ajax";
import {map, Observable} from "rxjs";
import {User} from "../Types/User";
import {Permissions} from "../Types/Permissions";
import {getCookie} from "../../Login/Api/login-logout";
import {response} from "../Types/ResponseType";
import {number} from "yup";
import {Page} from "../Types/Page";
import {UsersPage} from "../Types/UsersPage";
import {GetAjaxObservable} from "./TimeRequests";

interface GraphqlUsers {
    user: {
        users: User[]
    }
}

const url = "https://localhost:7226/graphql";

export function RequestUsers(): Observable<User[]> {
    return GetAjaxObservable<GraphqlUsers>(
        `
                query GetUsers{
                    user{
                        users{
                            id
                            login
                            fullName
                          }
                    }
                  }
            `, {})
        .pipe(
            map(res => {
                let users: User[] = res.response.data.user.users;

                return users;
            })
        );
}

interface GraphqlUsersBySearch {
    user: {
        usersBySearch: User[]
    }
}

export function RequestUsersBySearch(search: String): Observable<User[]> {
    return GetAjaxObservable<GraphqlUsersBySearch>(`
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
            `, {
        "search": search
    }).pipe(
        map(res => {
            let users: User[] = res.response.data.user.usersBySearch;

            return users;
        })
    );
}


interface GraphqlPagedUsers {
    user: {
        pagedUsers: {
            userList: User[],
            totalCount: number,
            pageIndex: number
        }
    }
}

export function RequestPagedUsers(page: Page): Observable<UsersPage> {
    return GetAjaxObservable<GraphqlPagedUsers>(`
                query GetPagedUsers($first: Int!, $after: Int!, $search: String, $orderfield: String, $order: String, $enabled: String){
                    user{
                        pagedUsers(first: $first, after: $after, search: $search, orderfield: $orderfield, order: $order, enabled: $enabled){
                            userList{
                                id
                                login
                                fullName
                                email
                                enabled
                              }
                              totalCount
                              pageIndex
                          }
                    }
                  }
            `,
        {
            "first": page.first,
            "after": page.after,
            "search": page.search,
            "orderfield": page.orderfield,
            "order": page.order,
            "enabled": page.enabled
        }).pipe(
        map(res => {
            let page: UsersPage = res.response.data.user.pagedUsers;

            return page;
        })
    );
}

interface GraphqlUser {
    user: {
        user: User
    }
}

export function RequestUser(Id: Number): Observable<User> {
    return GetAjaxObservable<GraphqlUser>(`
                query GetUser($Id: Int!){
                    user{
                        user(id: $Id){
                        id
                        login
                        fullName
                        email
                        enabled
                      }
                    }
                  }
            `,
        {
            "Id": Number(Id)
        }).pipe(
        map(res => {
            {
                return res.response.data.user.user
            }
        })
    );
}

interface GraphqlCurrentUser {
    user: {
        currentUser: User
    }
}

export function RequestCurrentUser(): Observable<User> {
    return GetAjaxObservable<GraphqlCurrentUser>(`
                query GetCurrentUser{
                    user{
                        currentUser{
                        id
                        login
                        fullName
                        email
                        enabled
                      }
                    }
                  }
            `, {}).pipe(
        map(res => {
            {
                return res.response.data.user.currentUser
            }
        })
    );
}

interface GraphqlUserPermissions {
    user: {
        userPermissions: Permissions
    }
}

export function RequestUserPermissions(Id: Number): Observable<Permissions> {
    return GetAjaxObservable<GraphqlUserPermissions>(`
                query GetUserPermissions($Id: Int!){
                    user{
                        userPermissions(id: $Id){
                        userId
                        cRUDUsers
                        viewUsers
                        editWorkHours
                        editApprovers
                        exportExcel
                        controlPresence
                        controlDayOffs
                      }
                    }
                  }
            `,
        {
            "Id": Id
        }).pipe(
        map(res => {
            {
                return res.response.data.user.userPermissions
            }
        })
    );
}

interface GraphqlCurrentUserPermissions {
    user: {
        currentUserPermissions: Permissions
    }
}

export function RequestCurrentUserPermissions(): Observable<Permissions> {
    return GetAjaxObservable<GraphqlCurrentUserPermissions>(`
                query GetCurrentUserPermissions{
                    user{
                        currentUserPermissions{
                        userId
                        cRUDUsers
                        viewUsers
                        editWorkHours
                        editApprovers
                        exportExcel
                        controlPresence
                        controlDayOffs
                      }
                    }
                  }
            `, {}).pipe(
        map(res => {
            {
                return res.response.data.user.currentUserPermissions
            }
        })
    );
}

interface GraphqlRequestPasswordReset {
    user: {
        RequestPasswordReset: string
    }
}

export function RequestPasswordReset(LoginOrEmail: String): Observable<string> {
    return GetAjaxObservable<GraphqlRequestPasswordReset>(`
                query sentResetPasswordEmail($LoginOrEmail: String!){
                    user{
                        sentResetPasswordEmail(loginOrEmail: $LoginOrEmail)
                    }
                  }
            `,
        {
            "LoginOrEmail": LoginOrEmail
        }
    ).pipe(
        map(res => {
            {
                return res.response.data.user.RequestPasswordReset;
            }
        })
    );
}

interface GraphqlCreateUser {
    user: {
        createUser: string
    }
}

export function RequestCreateUser(user: User, permissions: Permissions): Observable<string> {
    return GetAjaxObservable<GraphqlCreateUser>(`
                mutation createUser($User: UserInputType!, $Permissions: PermissionsInputType!){
                    user{
                        createUser(user: $User, permissions: $Permissions)
                    }
                  }
            `,
        {
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
                "editApprovers": permissions.editApprovers,
                "viewUsers": permissions.viewUsers,
                "editWorkHours": permissions.editWorkHours,
                "exportExcel": permissions.exportExcel,
                "controlPresence": permissions.controlPresence,
                "controlDayOffs": permissions.controlDayOffs,
            }
        }
    ).pipe(
        map(res => {
            return res.response.data.user.createUser
        })
    );
}

interface GraphqlUpdateUser {
    user: {
        updateUser: string
    }
}

export function RequestUpdateUser(user: User): Observable<string> {
    return GetAjaxObservable<GraphqlUpdateUser>(`
                mutation updateUser($Id : Int!, $User: UserInputType!){
                    user{
                        updateUser(id : $Id, user: $User)
                    }
                  }
            `, {
            "User": {
                "login": user.login,
                "fullName": user.fullName,
                "password": user.password,
                "email": user.email
            },
            "Id": Number(user.id)
        }
    ).pipe(
        map(res => {
            return res.response.data.user.updateUser
        })
    );
}

interface GraphqlRequestRegisterUserByCode {
    user: {
        registerUserByCode: string
    }
}

export function RequestRegisterUserByCode(Password: string, Login: string, Code: string, Email: string): Observable<string> {
    return GetAjaxObservable<GraphqlRequestRegisterUserByCode>(`
                mutation registerUserByCode($Code : String!, $Email: String!, $Login : String!, $Password: String!){
                    user{
                        registerUserByCode(code : $Code, email: $Email, password: $Password, login: $Login)
                    }
                  }
            `,
        {
            "Code": Code,
            "Email": Email,
            "Password": Password,
            "Login": Login
        }
    ).pipe(
        map(res => {
            return res.response.data.user.registerUserByCode
        })
    );
}

interface GraphqlUpdatePasswordByCode {
    user: {
        resetUserPasswordByCode: string
    }
}

export function RequestUpdatePasswordByCode(NewPassword: string, Code: string, Email: string): Observable<string> {
    return GetAjaxObservable<GraphqlUpdatePasswordByCode>(`
                mutation resetUserPasswordByCode($Code : String!, $NewPassword: String!, $Email: String!){
                    user{
                        resetUserPasswordByCode(code : $Code, password: $NewPassword, email: $Email)
                    }
                  }
            `,
        {
            "Code": Code,
            "NewPassword": NewPassword,
            "Email": Email,
        }
    ).pipe(
        map(res => {
            return res.response.data.user.resetUserPasswordByCode
        })
    );
}

interface GraphqlUpdatePassword {
    user: {
        updateUserPassword: string
    }
}

export function RequestUpdatePassword(id: Number, NewPassword: string, Password: string): Observable<string> {
    return GetAjaxObservable<GraphqlUpdatePassword>(`
                mutation updateUserPassword($id : Int!, $Password: String!, $NewPassword: String!){
                    user{
                        updateUserPassword(id : $id, password: $Password, newPassword: $NewPassword)
                    }
                  }
            `,
        {
            "id": Number(id),
            "Password": Password,
            "NewPassword": NewPassword
        }
    ).pipe(
        map(res => {
            return res.response.data.user.updateUserPassword
        })
    );
}

export function RequestUpdateUserPermissions(permissions: Permissions): Observable<string> {
    return GetAjaxObservable<string>(`
                mutation  updateUserPermissions($PermissionsType : PermissionsInputType!){
                    user{
                        updateUserPermissions(permissions : $PermissionsType)
                    }
                  }
            `,
        {
            "PermissionsType": {
                "userId": permissions.userId,
                "cRUDUsers": permissions.cRUDUsers,
                "editApprovers": permissions.editApprovers,
                "viewUsers": permissions.viewUsers,
                "editWorkHours": permissions.editWorkHours,
                "exportExcel": permissions.exportExcel,
                "controlPresence": permissions.controlPresence,
                "controlDayOffs": permissions.controlDayOffs
            }
        }
    ).pipe(
        map(res => res.response.data)
    );
}

export function RequestDisableUser(id: number): Observable<string> {
    return GetAjaxObservable<string>(`
                mutation DisableUser($id: Int!) {
                    user{
                        disableUser(id: $id)
                    }
                }
            `,
        {
            "id": Number(id)
        }
    ).pipe(
        map(res => res.response.data)
    );
}

interface GraphqlExportExcel {
    user: {
        getExcelFile: string
    }
}

export function RequestExportExcel(page: Page): Observable<string> {
    return GetAjaxObservable<GraphqlExportExcel>(`
                query ExportExcel($search: String, $orderfield: String, $order: String, $enabled: String){
                    user{
                        getExcelFile(search: $search, orderField: $orderfield, order: $order, enabled: $enabled)
                    }
                  }
            `,
        {
            "search": page.search,
            "orderField": page.orderfield,
            "order": page.order,
            "enabled": page.enabled
        })
        .pipe(
            map(res => {
                const response: string = res.response.data.user.getExcelFile;
                console.log(response);
                return response;
            })
        );
}