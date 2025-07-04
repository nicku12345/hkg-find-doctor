import React, { useEffect } from 'react';
import { MapWidget } from "./MapWidget.tsx";
import 'leaflet/dist/leaflet.css';
import { connectAndQuery } from "../../db/db.ts";
import { useDispatch } from "react-redux";
import { MapList } from "./MapList.tsx";
import MapSearch from "./MapSearch.tsx";


export const Map: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchDoctorInfo = async() => {
            const doctors = await connectAndQuery()
            dispatch({ type: "REFRESH_DOCTORS", payload: { doctors: doctors } })
        }
        fetchDoctorInfo()
    }, [])

    return (
        <div className="flex flex-col h-[calc(100vh-112px)]">
            <MapSearch/>
            <MapWidget/>
            <div className="flex-1 overflow-y-auto p-4">
                <MapList/>
            </div>
        </div>
    );
};
