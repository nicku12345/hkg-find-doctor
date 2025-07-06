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
import { marker } from "leaflet";
import { doctorToId } from "../../utils/doctor.ts";

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
    const { centerLatitude, centerLongitude } = useSelector((state: RootState) => state.geolocation)
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
                <h4 className="font-semibold">
                    {doctor.doctorNameEN} ({doctor.doctorNameTC})
                </h4>
                <p><strong>Specialty:</strong> {doctor.medicalSpecialty}</p>
                <p><strong>Telephone:</strong> {doctor.telephone}</p>
                <p><strong>Address:</strong> {doctor.addressDesc}</p>
            </Popup>

        </Marker>
    )
}

export const MapWidget: React.FC = () => {
    const { centerLatitude, centerLongitude, zoom } = useSelector((state: RootState) => state.geolocation)
    const { doctors } = useSelector((state: RootState) => state.doctorInfos)

    const position: [number, number] = [centerLatitude, centerLongitude];

    return (
        <div className="z-0 !important">
            <MapContainer center={position} zoom={zoom} style={{ height: '30vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
                <LocationMarker position={position} />
                {
                    doctors.map((doctor, index) => <DoctorMarker key={`doctor-${doctor.doctorNameTC}`} doctor={doctor}/>)
                }
            </MapContainer>
        </div>
    );
};