
import React from 'react';
import 'leaflet/dist/leaflet.css';
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";


export const MapList: React.FC = () => {
    const { doctors } = useSelector((state: RootState) => state.doctorInfos);

    return (
        <div>
            <ul>
                {doctors.map((doctor, index) => (
                    <li key={index} className="mb-4">
                        <h2 className="text-xl font-semibold">
                            {doctor.doctorNameEN} ({doctor.doctorNameTC})
                        </h2>
                        <p><strong>Specialty:</strong> {doctor.medicalSpecialty}</p>
                        <p><strong>Qualifications:</strong> {doctor.qualifications}</p>
                        <p><strong>Telephone:</strong> {doctor.telephone}</p>
                        <p><strong>Address:</strong> {doctor.addressDesc}</p>
                        <p><strong>Location:</strong> Latitude {doctor.addressLatitude}, Longitude {doctor.addressLongitude}</p>
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
};
