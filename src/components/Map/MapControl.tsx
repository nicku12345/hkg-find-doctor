import React from 'react';
import type { RootState } from "../../store/store.ts";
import { useDispatch, useSelector } from 'react-redux';

export const MapControl: React.FC = () => {
    const dispatch = useDispatch();
    const { latitude, longitude } = useSelector((state: RootState) => state.geolocation);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    dispatch({ type: "REFRESH_LOCATION", payload: { latitude: latitude, longitude: longitude } })
                },
                (err) => {
                    dispatch({ type: "SET_ERROR", payload: { error: err.message} })
                }
            );
        } else {
            dispatch({ type: "SET_ERROR", payload: { error: "Geolocation is not supported" } })
        }
    };

    return (
        <div className="p-4">
            {latitude && longitude ? (
                <p>
                    Latitude: {latitude}, Longitude: {longitude}
                </p>
            ) : (
                <p>Location not available.</p>
            )}
            <button onClick={getLocation} className="mt-4 p-2 bg-blue-500 text-white rounded">
                Refresh Location
            </button>
        </div>
    );
};