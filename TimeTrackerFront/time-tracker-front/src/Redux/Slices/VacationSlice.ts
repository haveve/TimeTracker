import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "../Types/User";
import {VacationRequest} from "../Types/VacationRequest";
import {getVacationRequestsByRequesterId} from "../epics";
import {ApproverNode} from "../Types/ApproverNode";


export interface vacationState {
    approvers: User[],
    vacationRequests: VacationRequest[],
    approversReaction: ApproverNode[]
}

const initialState: vacationState = {
    approvers: [],
    vacationRequests: [],
    approversReaction: []
}
export const vacationSlice = createSlice({
    name: "vacation",
    initialState,
    reducers: {
        getApproversList: (state,
                           action: PayloadAction<User[]>) => {
            state.approvers = action.payload
        },
        getVacationRequestsListByRequesterId: (state,
                                  action: PayloadAction<VacationRequest[]>) => {
            state.vacationRequests = action.payload
        },
        getApproversReactionList: (state, action:PayloadAction<ApproverNode[]>) =>{
            state.approversReaction = action.payload
        }
    }
});
export const {
    getApproversList,
    getVacationRequestsListByRequesterId,
    getApproversReactionList
} = vacationSlice.actions;

export default vacationSlice.reducer;