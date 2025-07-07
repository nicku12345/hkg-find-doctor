import React, { useEffect, useRef, useState  } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import type { RootState } from "../../store/store.ts";
import { useDispatch, useSelector } from 'react-redux';
import L from 'leaflet';
import { Doctor } from "../../types/doctor.ts";
import { Dispatch } from "@reduxjs/toolkit";
import { Action } from "../../store/reducers/actions.ts";
import { getSupabaseClient } from "../../db/db.ts";
import { Bounds } from "leaflet";
import { doctorToId, isDoctorInBusinessHour } from "../../utils/doctor.ts";

const markerIcon = L.icon({
    iconUrl: '/map/marker-icon.png'
})

const doctorIcon = L.icon({
    iconUrl: '/map/clinic.png'
})

const LocationMarker: React.FC = () => {
    const map = useMap();
    const { centerLatitude, centerLongitude, zoom, latitude, longitude } = useSelector((state: RootState) => state.geolocation)
    const { mapCenterFlag } = useSelector((state: RootState) => state.geolocation)
    const dispatch = useDispatch<Dispatch<Action>>()

    useEffect(() => {
        // Set the map view to the new position whenever it changes
        map.closePopup()
        map.setView([centerLatitude, centerLongitude], zoom)
    }, [mapCenterFlag, centerLatitude, centerLongitude]);

    const timeoutRef = useRef<number>(null)

    useEffect(() => {
        const handleBoundsChange = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // avoid loading DB when grid area is too large
            if (map.getZoom() <= 15) {
                dispatch({ type: "SET_WARNING", payload: { warning: "Zoom in to load more doctors" }})
                return
            }

            const bounds: Bounds = map.getBounds();
            const minLat = bounds._southWest.lat - 0.0006
            const minLong = bounds._southWest.lng - 0.0006
            const maxLat = bounds._northEast.lat + 0.0006
            const maxLong = bounds._northEast.lng + 0.0006

            timeoutRef.current = setTimeout(() => {
                dispatch({ type: "SET_IS_LOADING_DOCTOR_INFO", payload: { isLoadingDoctorInfo: true } })
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
                    dispatch({ type: "SET_IS_LOADING_DOCTOR_INFO", payload: { isLoadingDoctorInfo: false } })
                });
            }, 250)
        }

        map.on("moveend", handleBoundsChange)
        return () => {
            map.off("moveend", handleBoundsChange)
        }

    }, [])

    return <Marker position={[latitude, longitude]} icon={markerIcon}/>;
};

const DoctorMarker: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
    const { selectedDoctor } = useSelector((state: RootState) => state.doctorInfos)
    const myId = doctorToId(doctor)
    const dispatch = useDispatch<Dispatch<Action>>()
    const markerRef = useRef(null)

    const handleMarkerClick = () => {
        dispatch({ type: "SET_SELECTED_DOCTOR", payload: { selectedDoctor: doctor }})
    };

    useEffect(() => {
        const marker = markerRef.current
        if (marker && selectedDoctor && doctorToId(selectedDoctor) == myId) {
            marker.openPopup()
        }

    }, [selectedDoctor])

    return (
        <Marker
            position={[doctor.addressLatitude, doctor.addressLongitude]}
            eventHandlers={{
                click: handleMarkerClick,
            }}
            icon={doctorIcon}
            ref={markerRef}
        >
            <Popup interactive>
                <h4 className="font-semibold text-base text-gray-800">
                    {doctor.doctorNameEN} ({doctor.doctorNameTC})
                </h4>
                <p className="text-gray-600">
                    💉 {doctor.medicalSpecialtyDetailed}
                </p>
                <p className="text-gray-600">
                    ☎️ {doctor.telephone}
                </p>
                <p className="text-gray-600">
                    📍 {doctor.addressDesc}
                </p>
            </Popup>
        </Marker>
    )
}

export const MapWidget: React.FC = () => {
    const { centerLatitude, centerLongitude, zoom } = useSelector((state: RootState) => state.geolocation)
    const { doctors, filterMedicalSpecialty, filterBusinessStatus } = useSelector((state: RootState) => state.doctorInfos)

    const position: [number, number] = [centerLatitude, centerLongitude];

    const filteredDoctors: Doctor[] = doctors
        .filter(doctor => filterMedicalSpecialty === undefined || filterMedicalSpecialty === "" || doctor.medicalSpecialty === filterMedicalSpecialty)
        .filter(doctor => filterBusinessStatus?.length>0 ? filterBusinessStatus?.includes(isDoctorInBusinessHour(JSON.parse(doctor.openingHours))) : true )

    return (
        <div className="z-0 !important">
            <MapContainer center={position} zoom={zoom} style={{ height: '30vh', width: '100%', zIndex: 0 }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
                <LocationMarker position={position} />
                {
                    filteredDoctors.map((doctor, index) => <DoctorMarker key={doctorToId(doctor)} doctor={doctor}/>)
                }
            </MapContainer>
        </div>
    );
};