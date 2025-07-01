import { Doctor } from "../../types/doctor.ts";

const initialState = { doctors: [] }

type Action = { type: "REFRESH_DOCTORS", payload: { doctors: Doctor[] } }

export const doctorInfoReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case "REFRESH_DOCTORS":
            return { doctors: action.payload.doctors }
        default:
            return state
    }
}