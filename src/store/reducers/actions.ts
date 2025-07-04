
import { Action as TabAction } from "./tabReducer.ts";
import { Action as GeolocationAction } from "./geolocationReducer.ts";
import { Action as DoctorInfoAction } from "./doctorInfoReducer.ts";
import { Action as ErrorAction } from "./errorReducer.ts";

export type Action = 
    TabAction
    | GeolocationAction
    | DoctorInfoAction
    | ErrorAction