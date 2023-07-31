import {User} from "./User";

export interface VacationRequest {
    id: number,
    requesterId: number,
    infoAboutRequest: string,
    status: string,
    startDate: Date,
    endDate: Date
    requester: User
}