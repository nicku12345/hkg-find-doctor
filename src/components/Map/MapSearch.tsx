import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSuggestedMapLocations, MapLocation } from "../../utils/map.ts";
import { RootState } from "../../store/store.ts";
import { Action } from "../../store/reducers/actions.ts";
import { Dispatch } from "@reduxjs/toolkit";

type MapFilterProps = {
    selected: string,
}

const MapSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { latitude, longitude, selectedLocationDesc, filteredDistrict } = useSelector((state: RootState) => state.geolocation)
    const [suggestedMapLocations, setSuggestedMapLocations] = useState<MapLocation[]>([]);
    const dispatch = useDispatch<Dispatch<Action>>()

    const handleFocus = () => {
        setIsOpen(true);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isOpen) setIsOpen(true)
        dispatch({ type: "SET_SELECTED_LOCATION", payload: { selectedLocationDesc: event.target.value }})
    };

    const handleSelect = (location: MapLocation) => {
        dispatch({ type: "SET_SELECTED_LOCATION", payload: { selectedLocationDesc: location.descTC }})
        dispatch({ type: "REFRESH_LOCATION", payload: { latitude: location.latitude, longitude: location.longitude } })
        setIsOpen(false)
    }

    useEffect(() => {
        const handler = setTimeout(async () => {
            const res = await getSuggestedMapLocations(selectedLocationDesc);
            setSuggestedMapLocations(res)
        }, 100); // Delay of 0.1 seconds

        return () => {
            clearTimeout(handler); // Cleanup the timeout if query changes
        };
    }, [selectedLocationDesc]);

    const handleMapFocus = () => {
        // this will make the Map View focus on "myLocation"
        dispatch({
            type: "TOGGLE_MAP_CENTER_FLAG",
            payload: { centerLatitude: latitude, centerLongitude: longitude }
        })
    }

    const getLocationNavigator = () => {
        if (!navigator.geolocation) {
            dispatch({ type: "SET_ERROR", payload: { error: "Geolocation is not supported" } })
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                dispatch({ type: "REFRESH_LOCATION", payload: { latitude: latitude, longitude: longitude } })
            },
            (err) => {
                dispatch({ type: "SET_ERROR", payload: { error: err.message } })
            },
            { maximumAge: 0 },
        );

        if (isOpen)
            setIsOpen(false)
    };

    return (
        <div className="relative">
            <div className="flex items-center p-2">
                <input
                    type="text"
                    value={selectedLocationDesc}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    placeholder="Search..."
                    className="p-2 border border-gray-300 rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleMapFocus}
                    className="ml-2 p-2 bg-gray-200 text-white rounded transition duration-200 ease-in-out hover:bg-gray-500"
                >
                    <img 
                        src="map/redo.png" 
                        alt="Back" 
                        className="h-6 w-6 object-contain rounded"
                    />
                </button>
                <button 
                    onClick={getLocationNavigator} 
                    className="ml-2 p-2 bg-gray-200 text-white rounded transition duration-200 ease-in-out hover:bg-gray-500"
                >
                    <img 
                        src="map/location.png" 
                        alt="Location" 
                        className="h-6 w-6 object-contain rounded"
                    />
                </button>
            </div>
            {isOpen && (
                <div className="h-[calc(100vh-155px)] absolute z-10 left-0 right-0 bg-white border border-gray-300 shadow-lg overflow-hidden">
                    <div className="flex bg-white justify-end p-2">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="ml-2 bg-gray-300 text-gray-800 rounded px-3 py-1 hover:bg-gray-400 transition duration-200"
                        >
                            <img 
                                src="map/close-window.png" 
                                alt="Close" 
                                className="h-6 w-6 object-cover rounded"
                            />
                        </button>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <ul className="list-none p-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                        {suggestedMapLocations
                            .filter(x => {
                                if (filteredDistrict !== "")
                                    return x.suppDescTC === filteredDistrict
                                return true
                            })
                            .map((location, index) => (
                                <li key={index} className="first:pt-0 last:pb-0">
                                    <div 
                                        className="p-4 m-2 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
                                        onClick={() => handleSelect(location)}
                                    >
                                        <h2 className="text-lg font-semibold text-gray-800">{location.descTC}</h2>
                                        <p className="text-sm text-gray-600">{location.suppDescTC}</p>
                                    </div>
                                </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MapSearch;