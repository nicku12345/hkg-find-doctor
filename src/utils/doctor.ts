import { BusinessHour, DoctorBusinessHours, WEEKDAYS } from "../types/doctor.ts";


export type DoctorBusinessStatus =
    "OPEN"
    | "CLOSED"
    | "NO_INFO"

export const isDoctorInBusinessHour = (schedule: DoctorBusinessHours): DoctorBusinessStatus => {
    const currentDate = new Date()
    const options = { timeZone: 'Asia/Hong_Kong', hour: '2-digit', hour12: false };
    const currentWeekday = (currentDate.getDay()+6)%7  // getDay() = 0 for Sunday

    const key = WEEKDAYS[currentWeekday]
    const openingHoursForWeekday: BusinessHour = schedule[key] as BusinessHour
    if (openingHoursForWeekday === undefined)
        return "NO_INFO"

    const timeInHKG = new Intl.DateTimeFormat('en-US', options).format(currentDate);

    // Split the formatted time into hours and minutes
    const [hourInHKG, minuteInHKG] = timeInHKG.split(':').map(Number);
    const convertToInt = (h: number, m: number) => h*60 + m

    if (openingHoursForWeekday === "NO_BUSINESS")
        return "CLOSED"

    if (openingHoursForWeekday === "NO_INFO")
        return "NO_INFO"

    for (const b of openingHoursForWeekday) {
        if (convertToInt(b.from.h, b.from.m) <= convertToInt(hourInHKG, minuteInHKG)
            && convertToInt(hourInHKG, minuteInHKG) <= convertToInt(b.to.h, b.to.m))
            return "OPEN"
    }

    return "CLOSED"
}