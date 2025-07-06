import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { BusinessHour, Doctor, DoctorBusinessHours, WEEKDAYS } from "../../types/doctor.ts";
import { doctorToId, isDoctorInBusinessHour } from "../../utils/doctor.ts";
import { Action } from "../../store/reducers/actions.ts";
import { Dispatch } from "@reduxjs/toolkit";

// select "medicalSpecialty", count(1) from "DoctorInfo"
// group by "medicalSpecialty"
// order by count desc
// -- switched dentists & general practioners
const specialties = [
    "普通科",
    "牙科",
    "外科",
    "婦產科",
    "兒科",
    "骨科",
    "家庭醫學",
    "眼科",
    "精神科",
    "內科",
    "放射科",
    "心臟科",
    "耳鼻喉科",
    "腸胃肝臟科",
    "脊骨神經科",
    "急症科",
    "泌尿外科",
    "皮膚及性病科",
    "臨床腫瘤科",
    "呼吸系統科",
    "麻醉科",
    "整形外科",
    "內分泌及糖尿科",
    "腎病科",
    "腦神經科",
    "兒科",
    "老人科",
    "牙科",
    "腦外科",
    "風濕病科",
    "牙科",
    "血液及血液腫瘤科",
    "牙科",
    "心胸肺外科",
    "小兒外科",
    "病理學",
    "牙科",
    "內科腫瘤科",
    "牙科",
    "牙齒矯正科",
    "病理科",
    "社會醫學",
    "牙科",
    "",
    "核子醫學科",
    "牙科",
    "心臟科",
    "牙科-修復齒科",
    "兒科/內科",
    "內科",
    "深切治療科",
    "感染及傳染病科",
    "老人科/內科",
    "皮膚科",
    "風濕病科/內科",
    "腦神經科",
    "老人科",
    "牙科",
    "泌尿科",
    "牙髓治療科",
    "腎病科",
    "外科",
    "內科/風濕病科",
    "急症科/外科",
    "兒科",
    "腎病科/家庭醫學",
    "家庭牙醫科",
    "內科/腎病科",
    "牙科/口腔頜面外科",
    "內科",
    "內科",
    "內科",
    "牙科",
    "腸胃肝臟科",
    "骨科/復康科",
    "急症科／內科",
    "骨科",
    "牙科-口腔頜面外科",
    "深切治療科",
    "復康科/老人科",
    "牙科",
    "牙周治療科",
    "牙科-牙齒矯正科",
    "家庭醫學",
    "修復齒科",
    "外科",
    "內科/老人科",
    "呼吸系統科/內科",
    "風濕病科",
    "口腔頜面外科",
    "臨床腫瘤",
    "兒科/急症科",
    "婦產科",
    "兒童免疫及傳染病科",
    "兒科",
    "內分泌及糖尿病",
    "兒科",
    "腸胃肝臟內科",
    "內科腫廇科",
    "神經外科",
    // Add more specialties as needed
];

type DoctorBusinessHoursViewProps = {
    schedule: DoctorBusinessHours
}

const DoctorBusinessHoursView: React.FC<DoctorBusinessHoursViewProps> = ({ schedule }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatNumber = (x: number): string => (x < 10 ? `0${x}` : `${x}`);
    const formatInterval = (b: BusinessHour): string =>
        `${formatNumber(b.from.h)}:${formatNumber(b.from.m)} - ${formatNumber(b.to.h)}:${formatNumber(b.to.m)}`;

    return (
        <div className="mt-2 bg-stone-100 shadow-md rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 flex justify-between w-full text-left rounded bg-stone-300 text-gray-600 font-semibold hover:bg-stone-400 focus:outline-none"
            >
                <span>Business Hours</span>
                <span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                <div className="p-2">
                    {schedule.byAppointment && (
                        <div className="mb-2">
                            <span className="bg-blue-200 text-blue-800 p-1 rounded text-xs font-semibold">
                                By Appointment
                            </span>
                        </div>
                    )}
                    <table className="min-w-full text-sm">
                        <tbody>
                            {WEEKDAYS.map(day => {
                                if (schedule[day] as BusinessHour === undefined || schedule[day] as BusinessHour === "NO_INFO") {
                                    return null;
                                }

                                return (
                                    <tr key={day}>
                                        <td className="font-semibold py-2 w-1/8">{day}</td>
                                        <td className="py-2">
                                            {schedule[day] as BusinessHour === "NO_BUSINESS" ? (
                                                <span className="bg-red-200 text-red-800 p-2 rounded text-xs font-semibold">
                                                    CLOSED
                                                </span>
                                            ) : (
                                                schedule[day].map((b, index) => (
                                                    <span key={index} className="bg-gray-200 text-gray-600 mr-2 p-2 rounded text-xs">
                                                        {formatInterval(b)}
                                                    </span>
                                                ))
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const MapFilter: React.FC = () => {
    const { filterMedicalSpecialty } = useSelector((state: RootState) => state.doctorInfos);
    const dispatch = useDispatch<Dispatch<Action>>()
    const onSelectFilterMedicalSpecialty = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch({ type: "SET_FILTER_MEDICAL_SPECIALTY", payload: { filterMedicalSpecialty: e.target.value }})
    }
    return (
        <div className="p-2 bg-white z-5 mb-3 shadow-md">
            <label htmlFor="specialtyFilter" className="block text-lg font-medium text-gray-700 mb-2">
                Filter by Specialty:
            </label>
            <select
                id="specialtyFilter"
                value={filterMedicalSpecialty}
                onChange={onSelectFilterMedicalSpecialty}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50 p-2"
            >
                <option value="">-</option>
                {specialties.map((specialty, index) => (
                    <option key={index} value={specialty}>
                        {specialty}
                    </option>
                ))}
            </select>
        </div>
    )

}

export const MapList: React.FC = () => {
    const { doctors, selectedDoctor, filterMedicalSpecialty, isLoadingDoctorInfo } = useSelector((state: RootState) => state.doctorInfos);

    const dispatch = useDispatch<Dispatch<Action>>()

    const filteredDoctors = filterMedicalSpecialty
        ? doctors.filter(doctor => filterMedicalSpecialty === undefined || filterMedicalSpecialty === "" || doctor.medicalSpecialty === filterMedicalSpecialty)
        : doctors;

    const itemRefs = useRef<Map<string, HTMLElement>>(new Map())
    const scrollToItem = (doctor) => {
        const key = doctorToId(doctor);
        if (itemRefs.current[key]) {
            itemRefs.current[key].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        if (selectedDoctor !== undefined) {
            const timeoutId = setTimeout(() => scrollToItem(selectedDoctor), 500)
            return () => clearTimeout(timeoutId)
        }
    }, [selectedDoctor, doctors])

    const handleDoctorOnClick = (doctor: Doctor) => {
        dispatch({
            type: "SET_SELECTED_DOCTOR",
            payload: { selectedDoctor: doctor }
        })
    }

    return (
        <div className="flex flex-col">
            <MapFilter/>
            <div className="flex-grow-1 overflow-y-scroll max-h-160">
                <ul className="space-y-4 p-2">
                    {filteredDoctors.map((doctor, index) => {
                        const doctorBusinessStatus = isDoctorInBusinessHour(JSON.parse(doctor.openingHours))
                        return (
                            <li
                                key={doctor.doctorNameEN + index}
                                className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between"
                                ref={(el) => (itemRefs.current[doctorToId(doctor)] = el)}
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-center bg-stone-100 hover:bg-stone-300 p-1 pl-2 pr-2 rounded" onClick={() => handleDoctorOnClick(doctor)}>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {doctor.doctorNameEN} ({doctor.doctorNameTC})
                                        </h2>
                                        {
                                            doctorBusinessStatus === "CLOSED" ? (
                                                <span className="bg-red-200 text-red-800 p-2 rounded text-xs font-semibold">
                                                    {isDoctorInBusinessHour(JSON.parse(doctor.openingHours))}
                                                </span>
                                            ) : doctorBusinessStatus === "OPEN" ? (
                                                <span className="bg-green-200 text-green-800 p-2 rounded text-xs font-semibold">
                                                    {isDoctorInBusinessHour(JSON.parse(doctor.openingHours))}
                                                </span>
                                            ) : null
                                        }
                                    </div>
                                    <p className="text-gray-600"><strong>💉</strong> {doctor.medicalSpecialty}</p>
                                    {
                                        (JSON.parse(doctor.qualifications) as string[])
                                            .filter(q => q.trim() !== "")
                                            .map(qualification => (
                                                <p className="text-gray-600"><strong>🎓</strong> {qualification}</p>
                                            ))
                                    }
                                    {
                                        doctor.telephone.trim() !== "" ? (
                                            <p className="text-gray-600"><strong>☎️</strong> {doctor.telephone}</p>
                                        ) : null
                                    }
                                    {
                                        doctor.addressDesc.trim() !== "" ? (
                                            <p className="text-gray-600"><strong>📍</strong> {doctor.addressDesc}</p>
                                        ) : null
                                    }
                                    <DoctorBusinessHoursView schedule={JSON.parse(doctor.openingHours)}/>
                                </div>
                            </li>
                        )}
                    )}
                </ul>
            </div>
        </div>
    );
};