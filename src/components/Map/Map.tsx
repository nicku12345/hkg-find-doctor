import React, { useEffect } from 'react';
import { MapControl } from "./MapControl.tsx";
import { MapWidget } from "./MapWidget.tsx";
import 'leaflet/dist/leaflet.css';
import { connectAndQuery } from "../../db/db.ts";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";
import { MapList } from "./MapList.tsx";


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
            <MapControl/>
            <MapWidget/>
            <div className="flex-1 overflow-y-auto p-4">
                <MapList/>
            </div>
        </div>
    );
};
