import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { BusinessHour, Doctor, DoctorBusinessHours, WEEKDAYS } from "../../types/doctor.ts";
import { doctorToId, isDoctorInBusinessHour } from "../../utils/doctor.ts";
import { Action } from "../../store/reducers/actions.ts";
import { Dispatch } from "@reduxjs/toolkit";


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

export const MapList: React.FC = () => {
    const { doctors, selectedDoctor, filterMedicalSpecialty, filterBusinessStatus } = useSelector((state: RootState) => state.doctorInfos);

    const dispatch = useDispatch<Dispatch<Action>>()

    const filteredDoctors: Doctor[] = ((selectedDoctor ? [selectedDoctor] : [])
        .concat(
            doctors.filter(doctor => selectedDoctor === undefined || doctorToId(doctor) !== doctorToId(selectedDoctor))
        ))
        .filter(doctor => filterMedicalSpecialty === undefined || filterMedicalSpecialty === "" || doctor.medicalSpecialty === filterMedicalSpecialty)
        .filter(doctor => filterBusinessStatus?.length>0 ? filterBusinessStatus?.includes(isDoctorInBusinessHour(JSON.parse(doctor.openingHours))) : true )

    const handleDoctorOnClick = (doctor: Doctor) => {
        dispatch({
            type: "SET_SELECTED_DOCTOR",
            payload: { selectedDoctor: doctor }
        })
    }

    return (
        <div className="flex flex-col overflow-y-auto max-h-[calc(70vh-240px)]">
            <ul className="space-y-4 p-2">
                {filteredDoctors.map((doctor, index) => {
                    const doctorBusinessStatus = isDoctorInBusinessHour(JSON.parse(doctor.openingHours))
                    const pin = selectedDoctor === undefined || doctorToId(selectedDoctor) !== doctorToId(doctor)
                        ? ""
                        : "📌"
                    return (
                        <li
                            key={doctorToId(doctor)}
                            className={`bg-white-100 shadow-md rounded-lg p-4 border border-gray-200 flex justify-between`}
                        >
                            <div className="flex-1">
                                <div className="flex justify-between items-center bg-stone-100 hover:bg-stone-300 p-1 pl-2 pr-2 rounded" onClick={() => handleDoctorOnClick(doctor)}>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {pin} {doctor.doctorNameEN} ({doctor.doctorNameTC})
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
                                <p className="text-gray-600"><strong>💉</strong> {doctor.medicalSpecialtyDetailed}</p>
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
    );
};