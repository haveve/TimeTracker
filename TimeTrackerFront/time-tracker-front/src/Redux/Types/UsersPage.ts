import { User } from "./User";

export interface UsersPage {
    userList: User[]
    totalCount: number,
    pageIndex: number,
}