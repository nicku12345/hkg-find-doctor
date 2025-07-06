export type Doctor = {
    doctorNameTC: string,
    doctorNameEN: string,
    telephone: string,
    medicalSpecialty: string,
    addressDesc: string,
    addressLatitude: number,
    addressLongitude: number,
    qualifications: string,
    openingHours: string,
}

export type DoctorBusinessStatus =
    "OPEN"
    | "CLOSED"
    | "NO_INFO"

export type BusinessHour = 
    "NO_INFO"
    | "NO_BUSINESS"
    | {
        from: {
            h: number,
            m: number,
        },

        to: {
            h: number,
            m: number,
        }
    } []

export type DoctorBusinessHours = {
    byAppointment?: Boolean,
    MON?: BusinessHour,
    TUE?: BusinessHour,
    WED?: BusinessHour,
    THU?: BusinessHour,
    FRI?: BusinessHour,
    SAT?: BusinessHour,
    SUN?: BusinessHour,
}

export const WEEKDAYS = [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
]