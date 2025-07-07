import React, { useEffect } from 'react';
import { MapWidget } from "./MapWidget.tsx";
import 'leaflet/dist/leaflet.css';
import { connectAndQuery } from "../../db/db.ts";
import { useDispatch } from "react-redux";
import { MapList } from "./MapList.tsx";
import MapSearch from "./MapSearch.tsx";
import { MapFilter } from "./MapFilter.tsx";


export const Map: React.FC = () => {
    return (
        <div>
            <MapSearch/>
            <MapWidget/>
            <MapFilter/>
            <MapList/>
        </div>
    );
};
