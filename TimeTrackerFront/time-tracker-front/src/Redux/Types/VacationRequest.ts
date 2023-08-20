import {User} from "./User";
import {ApproverNode} from "./ApproverNode";

export interface VacationRequest {
    id: number,
    requesterId: number,
    infoAboutRequest: string,
    status: string,
    startDate: Date,
    endDate: Date
    requester: User,
    approversNodes: Array<ApproverNode>
}