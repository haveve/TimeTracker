import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "../Types/User";


export interface vacationState {
    approvers: User[]
}
const initialState : vacationState ={
    approvers: []
}
export const vacationSlice = createSlice({
    name: "vacation",
    initialState,
    reducers: {
        getApprovers: (state,action: PayloadAction<User[]>)=>{
            state.approvers = action.payload
        }
    }
});
export const{
    getApprovers
} = vacationSlice.actions;

export default vacationSlice.reducer;