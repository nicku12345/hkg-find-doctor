import React, { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { BusinessHour, DoctorBusinessHours } from "../../types/doctor.ts";

// select "medicalSpecialty", count(1) from "DoctorInfo"
// group by "medicalSpecialty"
// order by count desc
const specialties = [
    "牙科",
    "普通科",
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
    const formatNumber = (x: number): string => (x < 10 ? `0${x}` : `${x}`);
    const formatInterval = (b: BusinessHour): string =>
        `${formatNumber(b.from.h)}:${formatNumber(b.from.m)} - ${formatNumber(b.to.h)}:${formatNumber(b.to.m)}`;

    return (
        <div className="p-2">
            {schedule.byAppointment && (
                <span className="bg-gray-200 text-gray-600 p-1 rounded">By Appointment</span>
            )}
            <table className="min-w-full text-sm">
                <tbody>
                    {
                        ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => {
                            if (schedule[day] === undefined) {
                                return null;
                            }

                            return (
                                <tr key={day}>
                                    <td className="font-semibold w-15">{day}</td>
                                    <td>
                                        {schedule[day].length === 0 ? (
                                            <span className="bg-red-200 p-1 rounded">CLOSED</span>
                                        ) : (
                                            schedule[day].map((b, index) => (
                                                <span key={index} className="bg-gray-200 text-gray-600 mr-2 p-1 rounded">
                                                    {formatInterval(b)}
                                                </span>
                                            ))
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
};

export const MapList: React.FC = () => {
    const { doctors } = useSelector((state: RootState) => state.doctorInfos);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");

    const filteredDoctors = selectedSpecialty
        ? doctors.filter(doctor => selectedSpecialty === "" || doctor.medicalSpecialty === selectedSpecialty)
        : doctors;

    return (
        <div>
            <div className="p-2 sticky top-0 bg-white z-10 mb-3 shadow-md">
                <label htmlFor="specialtyFilter" className="block text-lg font-medium text-gray-700 mb-2">
                    Filter by Specialty:
                </label>
                <select
                    id="specialtyFilter"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
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
            <ul className="space-y-4 p-2">
                {filteredDoctors.map((doctor, index) => (
<li key={index} className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between">
    <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
            {doctor.doctorNameEN} ({doctor.doctorNameTC})
        </h2>
        <p className="text-gray-600"><strong>💉</strong> {doctor.medicalSpecialty}</p>
        <p className="text-gray-600"><strong>🎓</strong> {doctor.qualifications}</p>
        <p className="text-gray-600"><strong>☎️</strong> {doctor.telephone}</p>
        <p className="text-gray-600"><strong>📍</strong> {doctor.addressDesc}</p>
        <DoctorBusinessHoursView schedule={JSON.parse(doctor.openingHours)}/>
    </div>
</li>
                ))}
            </ul>
        </div>
    );
};