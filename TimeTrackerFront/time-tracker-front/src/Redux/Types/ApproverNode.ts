import {User} from "./User";

export interface ApproverNode {
    id?: number,
    approverId: number,
    requesterId:number,
    requestId: number,
    isRequestApproved?: boolean,
    reactionMessage?: string,
    approver: User
}