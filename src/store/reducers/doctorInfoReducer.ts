import { Doctor, DoctorBusinessStatus } from "../../types/doctor.ts";

type DoctorInfoState = {
    doctors: Doctor[],
    selectedDoctor?: Doctor,
    
    filterMedicalSpecialty?: string,
    filterBusinessStatus?: DoctorBusinessStatus[],

    isLoadingDoctorInfo: boolean,
}

const initialState: DoctorInfoState = {
    doctors: [],
    selectedDoctor: undefined,

    filterMedicalSpecialty: undefined,
    filterBusinessStatus: undefined,

    isLoadingDoctorInfo: false,
}

export type Action =
    { type: "REFRESH_DOCTORS", payload: { doctors: Doctor[] } }
    | { type: "SET_SELECTED_DOCTOR", payload: { selectedDoctor: Doctor } }
    | { type: "SET_FILTER_MEDICAL_SPECIALTY", payload: { filterMedicalSpecialty?: string } }
    | { type: "SET_FILTER_BUSINESS_STATUS", payload: { filterBusinessStatus?: DoctorBusinessStatus[] } }
    | { type: "SET_IS_LOADING_DOCTOR_INFO", payload: { isLoadingDoctorInfo: boolean } }

export const doctorInfoReducer = (state = initialState, action: Action): DoctorInfoState => {
    switch (action.type) {
        case "REFRESH_DOCTORS":
            return { ...state, doctors: action.payload.doctors }

        case "SET_SELECTED_DOCTOR":
            return { ...state, selectedDoctor: action.payload.selectedDoctor }
        
        case "SET_FILTER_MEDICAL_SPECIALTY":
            return { ...state, filterMedicalSpecialty: action.payload.filterMedicalSpecialty }
        
        case "SET_FILTER_BUSINESS_STATUS":
            return { ...state, filterBusinessStatus: action.payload.filterBusinessStatus }
        
        case "SET_IS_LOADING_DOCTOR_INFO":
            return { ...state, isLoadingDoctorInfo: action.payload.isLoadingDoctorInfo }

        default:
            return state
    }
}