import {configureStore} from "@reduxjs/toolkit";
import {createEpicMiddleware} from "redux-observable";
import { rootEpic } from "./rootEpic";
import UserReducer from "./Slices/UserSlice";
import CurrentUserReducer from "./Slices/CurrentUserSlice";
import TimeReducer from "./Slices/TimeSlice";
import VacationReducer from "./Slices/VacationSlice";

const epicMiddleware = createEpicMiddleware();

const store = configureStore({
   reducer: {
      users: UserReducer,
      currentUser: CurrentUserReducer,
      time:TimeReducer,
      vacation:VacationReducer
   },
   middleware: [epicMiddleware]
});

epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>
export default store;