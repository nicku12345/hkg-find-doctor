export type Doctor = {
    doctorNameTC: string,
    doctorNameEN: string,
    telephone: string,
    medicalSpecialty: string,
    medicalSpecialtyDetailed: string,
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

// select "medicalSpecialty", count(1) from "DoctorInfo"
// group by "medicalSpecialty"
// order by count desc
// -- switched dentists & general practioners
export const MEDICAL_SPECIALTIES = [
    "普通科門診",
    "脊醫",
    "兒科",
    "婦產科",
    "牙醫",
    "耳鼻喉科",
    "皮膚及性病科",
    "家庭醫學",
    "眼科",
    "骨科",
    "腎病科",
    "心胸肺外科",
    "內科",
    "腸胃肝臟科",
    "風濕病科",
    "腦神經科",
    "精神科",
    "腦外科",
    "小兒外科",
    "心臟科",
    "血液及血液腫瘤科",
    "感染及傳染病科",
    "泌尿外科",
    "內分泌及糖尿科",
    "呼吸系統科",
    "外科",
    "麻醉科",
    "老人科",
    "復康科",
    "職業醫學",
    "免疫及過敏病科",
    "內科腫瘤科",
    "放射科",
    "臨床腫瘤科",
    "社會醫學",
    "整形外科",
    "病理學",
    "深切治療科",
    "急症科",
    "核子醫學科",
    // Add more specialties as needed
];