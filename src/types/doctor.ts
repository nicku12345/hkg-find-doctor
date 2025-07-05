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

export type BusinessHour = {
    from: {
        h: number,
        m: number,
    },

    to: {
        h: number,
        m: number,
    }
}

export type DoctorBusinessHours = {
    byAppointment?: Boolean,
    MON?: BusinessHour[],
    TUE?: BusinessHour[],
    WED?: BusinessHour[],
    THU?: BusinessHour[],
    FRI?: BusinessHour[],
    SAT?: BusinessHour[],
    SUN?: BusinessHour[],
}