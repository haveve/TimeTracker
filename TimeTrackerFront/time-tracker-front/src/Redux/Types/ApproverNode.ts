import {User} from "./User";

export interface ApproverNode {
    id?: number,
    userIdApprover: number,
    userIdRequester:number,
    requestId: number,
    isRequestApproved?: boolean,
    reactionMessage?: string,
    approver: User,

}