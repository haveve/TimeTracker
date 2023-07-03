import {ajax} from "rxjs/internal/ajax/ajax";
import {map, Observable} from "rxjs";
import { User } from "../Types/User";
import { getCookie } from "../../Login/Api/login-logout";
interface GraphqlUsers {
    data: {
        users: User[]
    } 
}
export function RequestUsers(): Observable<User[]> {
    return ajax<GraphqlUsers>({
        url: "https://localhost:7226/graphql",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+getCookie("access_token")
        },
        body: JSON.stringify({
            query: `
                query GetUsers {
                    users{
                        id
                        login
                        password
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

export function RequestDeleteUser(id: number): Observable<string> {
    return ajax<string>({
        url: "https://localhost:7226/graphql",
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+getCookie("access_token")
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