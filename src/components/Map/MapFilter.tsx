import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { Action } from "../../store/reducers/actions.ts";
import { Dispatch } from "@reduxjs/toolkit";
import { MEDICAL_SPECIALTIES } from "../../types/doctor.ts";
import { useState } from "react";

export const MapFilter: React.FC = () => {
    const { filterMedicalSpecialty } = useSelector((state: RootState) => state.doctorInfos);
    const dispatch = useDispatch<Dispatch<Action>>()
    const onSelectFilterMedicalSpecialty = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch({ type: "SET_FILTER_MEDICAL_SPECIALTY", payload: { filterMedicalSpecialty: e.target.value }})
    }
    const [openOnly, setOpenOnly] = useState(false);
    const onToggleOpenOnly = () => {
        if (!openOnly) {
            dispatch({ type: "SET_FILTER_BUSINESS_STATUS", payload: { filterBusinessStatus: [ "OPEN" ]}})
        } else {
            dispatch({ type: "SET_FILTER_BUSINESS_STATUS", payload: { filterBusinessStatus: []}})
        }
        setOpenOnly(!openOnly);
    };
    return (
<div className="p-2 bg-white shadow-md">
    <div className="flex items-center bg-stone-100 p-2 rounded-lg">
        <span className="text-xl mr-4">🔎</span> {/* Smiley face emoji */}

        <div className="flex justify-end items-center flex-grow">
            <div className="h-8 border-l border-gray-300 mx-2"></div>
            <div className="flex items-center mr-2">
                <label htmlFor="specialtyFilter" className="mr-2 font-medium text-gray-700">
                    專科
                </label>
                <select
                    id="specialtyFilter"
                    value={filterMedicalSpecialty}
                    onChange={onSelectFilterMedicalSpecialty}
                    className="border border-gray-300 rounded-md p-2"
                >
                    <option value="">-</option>
                    {MEDICAL_SPECIALTIES.map((specialty, index) => (
                        <option key={index} value={specialty}>
                            {specialty}
                        </option>
                    ))}
                </select>
            </div>

            {/* Vertical Bar */}
            <div className="h-8 border-l border-gray-300 mx-2"></div>

            <div className="flex items-center">
                <label htmlFor="openOnly" className="mr-2 font-medium text-gray-700">
                    營業中
                </label>
                <input
                    type="checkbox"
                    id="openOnly"
                    checked={openOnly}
                    onChange={onToggleOpenOnly}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
            </div>
        </div>
    </div>
</div>
    );
}