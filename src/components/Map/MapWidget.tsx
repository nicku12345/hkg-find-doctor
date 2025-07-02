import React, { useEffect, useState  } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import type { RootState } from "../../store/store.ts";
import { useSelector } from 'react-redux';
import L from 'leaflet';
import { Doctor } from "../../types/doctor.ts";

const markerIcon = L.icon({
    iconUrl: '/map/marker-icon.png'
})

const doctorIcon = L.icon({
    iconUrl: '/map/clinic.png'
})

const LocationMarker: React.FC<{ position: [number, number] }> = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        // Set the map view to the new position whenever it changes
        map.setView(position);
    }, [position, map]);
    return <Marker position={position} icon={markerIcon}/>;
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
    const { latitude, longitude } = useSelector((state: RootState) => state.geolocation);
    const { doctors } = useSelector((state: RootState) => state.doctorInfos)

    const position: [number, number] = [latitude, longitude];

    return (
        <div className="z-0 !important">
            <MapContainer center={position} zoom={20} style={{ height: '50vh', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} />
                {
                    doctors.map((doctor, index) => <DoctorMarker key={`doctor-${index}`} doctor={doctor}/>)
                }
            </MapContainer>
        </div>
    );
};