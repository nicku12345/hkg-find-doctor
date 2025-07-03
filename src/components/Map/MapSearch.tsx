import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSuggestedMapLocations, MapLocation } from "../../utils/map.ts";

const MapSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestedMapLocations, setSuggestedMapLocations] = useState<MapLocation[]>([]);
    const dispatch = useDispatch()

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isOpen) setIsOpen(true)
        setQuery(event.target.value);
    };

    const handleSelect = (location: MapLocation) => {
        setQuery(location.descTC)
        dispatch({ type: "REFRESH_LOCATION", payload: { latitude: location.latitude, longitude: location.longitude } })
        setIsOpen(false)
    }

    useEffect(() => {
        const handler = setTimeout(async () => {
            const res = await getSuggestedMapLocations(query);
            console.log(res)
            setSuggestedMapLocations(res)
        }, 300); // Delay of 0.3 seconds

        return () => {
            clearTimeout(handler); // Cleanup the timeout if query changes
        };
    }, [query]);


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
                dispatch({ type: "SET_ERROR", payload: { error: err.message} })
            }
        );

        if (isOpen)
            setIsOpen(false)
    };

    return (
        <div className="relative">
            <div className="flex items-center p-4">
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onClick={handleClick}
                    placeholder="Search..."
                    className="p-2 border border-gray-300 rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    onClick={getLocationNavigator} 
                    className="ml-2 p-2 bg-gray-200 text-white rounded transition duration-200 ease-in-out hover:bg-gray-500"
                >
                    <img 
                        src="map/location.png" 
                        alt="Location" 
                        className="h-6 w-6 object-cover rounded"
                    />
                </button>
            </div>
            {isOpen && (
                <div className="h-[calc(100vh-180px)] absolute z-10 left-0 right-0 bg-white border border-gray-300 shadow-lg overflow-hidden">
                    <div className="flex justify-end p-2">
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="bg-gray-300 text-gray-800 rounded px-3 py-1 hover:bg-gray-400 transition duration-200"
                        >
                            Close
                        </button>
                    </div>

                    <div className="border-t border-gray-200"></div>
                    <ul className="list-none p-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                        {suggestedMapLocations.map((location, index) => (
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