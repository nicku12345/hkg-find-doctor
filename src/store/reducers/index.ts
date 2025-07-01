import { combineReducers } from "@reduxjs/toolkit";
import { tabReducer } from "./tabReducer.ts";
import { geolocationReducer } from "./geolocationReducer.ts";
import { doctorInfoReducer } from "./doctorInfoReducer.ts";
import { errorReducer } from "./errorReducer.ts";

const rootReducer = combineReducers({
    tab: tabReducer,
    geolocation: geolocationReducer,
    doctorInfos: doctorInfoReducer,
    error: errorReducer,
})

export default rootReducer