import React, { useEffect, useState  } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import type { RootState } from "../../store/store.ts";
import { useDispatch, useSelector } from 'react-redux';
import L from 'leaflet';
import { Doctor } from "../../types/doctor.ts";
import { Dispatch } from "@reduxjs/toolkit";
import { Action } from "../../store/reducers/actions.ts";
import { getSupabaseClient } from "../../db/db.ts";
import { Bounds } from "leaflet";

const markerIcon = L.icon({
    iconUrl: '/map/marker-icon.png'
})

const doctorIcon = L.icon({
    iconUrl: '/map/clinic.png'
})

const LocationMarker: React.FC = () => {
    const map = useMap();
    const { latitude, longitude, zoom } = useSelector((state: RootState) => state.geolocation)
    const { mapCenterFlag } = useSelector((state: RootState) => state.geolocation)
    const dispatch = useDispatch<Dispatch<Action>>()

    useEffect(() => {
        // Set the map view to the new position whenever it changes
            map.setView([latitude, longitude], zoom)
    }, [mapCenterFlag, latitude, longitude]);

    useEffect(() => {
        const handleBoundsChange = () => {

            // avoid loading DB when grid area is too large
            if (map.getZoom() <= 15) {

                dispatch({ type: "SET_WARNING", payload: { warning: "Zoom in to load more doctors" }})
                return
            }

            const bounds: Bounds = map.getBounds();
            const minLat = bounds._southWest.lat - 0.0003
            const minLong = bounds._southWest.lng - 0.0003
            const maxLat = bounds._northEast.lat + 0.0003
            const maxLong = bounds._northEast.lng + 0.0003

            const supabase = getSupabaseClient();
            supabase.rpc("get_doctors_in_bbox", {
                min_lat: minLat,
                min_long: minLong,
                max_lat: maxLat,
                max_long: maxLong
            })
            .limit(2000)
            .then(({ data, error }) => {
                dispatch({ type: "REFRESH_DOCTORS", payload: { doctors: data } })
            });
        }

        map.on("moveend", handleBoundsChange)
        return () => {
            map.off("moveend", handleBoundsChange)
        }

    }, [map])

    return <Marker position={[latitude, longitude]} icon={markerIcon}/>;
};

const DoctorMarker: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
    const [popupVisible, setPopupVisible] = useState(false);

    const handleMarkerClick = () => {
        setPopupVisible(true);
    };

    return (
        <Marker
            position={[doctor.addressLatitude, doctor.addressLongitude]}
            eventHandlers={{
                click: handleMarkerClick,
            }}
            icon={doctorIcon}
        >
            {
                popupVisible && (
                    <Popup onClose={() => setPopupVisible(false)}>
                        <h4 className="font-semibold">
                            {doctor.doctorNameEN} ({doctor.doctorNameTC})
                        </h4>
                        <p><strong>Specialty:</strong> {doctor.medicalSpecialty}</p>
                        <p><strong>Telephone:</strong> {doctor.telephone}</p>
                        <p><strong>Address:</strong> {doctor.addressDesc}</p>
                    </Popup>
                )
            }

        </Marker>
    )
}

export const MapWidget: React.FC = () => {
    const { latitude, longitude, zoom } = useSelector((state: RootState) => state.geolocation)
    const { doctors } = useSelector((state: RootState) => state.doctorInfos)

    const position: [number, number] = [latitude, longitude];

    return (
        <div className="z-0 !important">
            <MapContainer center={position} zoom={zoom} style={{ height: '30vh', width: '100%' }}>
<TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
                <LocationMarker position={position} />
                {
                    doctors.map((doctor, index) => <DoctorMarker key={`doctor-${index}`} doctor={doctor}/>)
                }
            </MapContainer>
        </div>
    );
};