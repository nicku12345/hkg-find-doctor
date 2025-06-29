import { combineReducers } from "@reduxjs/toolkit";
import tabReducer from "./tabReducer.ts";

const rootReducer = combineReducers({
    tab: tabReducer,
})

export default rootReducer