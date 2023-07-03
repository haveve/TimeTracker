import {configureStore} from "@reduxjs/toolkit";
import {createEpicMiddleware} from "redux-observable";
import { rootEpic } from "./rootEpic";
import UserReducer from "./Slices/UserSlice";

const epicMiddleware = createEpicMiddleware();

const store = configureStore({
   reducer: {
      users: UserReducer
   },
   middleware: [epicMiddleware]
});

epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>
export default store;