import React, { useState, useEffect } from 'react';
import { parseStringPromise } from 'xml2js';
import { useDispatch } from 'react-redux';

type MapLocation = {
    descTC: string,
    descEN: string,
    latitude: number,
    longitude: number,
}

const getSuggestedMapLocations = async (query: string): Promise<MapLocation[]> => {
    if (query === "") {
        return []
    }

    const api = `https://www.als.gov.hk/lookup?q=${query}&n=20`
    const res = await fetch(api)
    const locations = await parseStringPromise(await res.text())

    // schema follows https://www.als.gov.hk/lookup?q=Kwai%20Chung&n=20
    const uniqueDescTC = new Set() // use descTC as key to dedup
    return locations
        .AddressLookupResult
        .SuggestedAddress
        .filter(x => 
            (
                x.Address?.[0]?.PremisesAddress?.[0]?.ChiPremisesAddress?.[0]?.BuildingName
                || x.Address?.[0]?.PremisesAddress?.[0]?.ChiPremisesAddress?.[0]?.ChiEstate?.[0]?.EstateName
            ) && (
                x.Address?.[0]?.PremisesAddress?.[0]?.EngPremisesAddress?.[0]?.BuildingName
                || x.Address?.[0]?.PremisesAddress?.[0]?.EngPremisesAddress?.[0]?.EngEstate?.[0]?.EstateName
            )
        )
        .map(x => {
            const buildingNameTC = x.Address?.[0]?.PremisesAddress?.[0]?.ChiPremisesAddress?.[0]?.BuildingName ?? ""
            const buildingNameEN = x.Address?.[0]?.PremisesAddress?.[0]?.EngPremisesAddress?.[0]?.BuildingName ?? ""
            const estateNameTC = x.Address?.[0]?.PremisesAddress?.[0]?.ChiPremisesAddress?.[0]?.ChiEstate?.[0]?.EstateName ?? ""
            const estateNameEN = x.Address?.[0]?.PremisesAddress?.[0]?.EngPremisesAddress?.[0]?.EngEstate?.[0]?.EstateName ?? ""

            return {
                descTC: `${estateNameTC} ${buildingNameTC}`.trim(),
                descEN: `${estateNameEN} ${buildingNameEN}`.trim(),
                latitude: x.Address[0].PremisesAddress[0].GeospatialInformation[0].Latitude[0],
                longitude: x.Address[0].PremisesAddress[0].GeospatialInformation[0].Longitude[0],
            }
        })
        .filter(({ descTC }) => {
            if (uniqueDescTC.has(descTC))
                return false;
            uniqueDescTC.add(descTC)
            return true;
        })
}

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
            setSuggestedMapLocations(res)
        }, 500); // Delay of 0.5 seconds

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
                <div className="h-[calc(100vh-200px)] absolute z-10 left-0 right-0 bg-white border border-gray-300 shadow-lg overflow-hidden">
                    <div className="flex justify-end p-2">
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="bg-gray-300 text-gray-800 rounded px-3 py-1 hover:bg-gray-400 transition duration-200"
                        >
                            Close
                        </button>
                    </div>

                    <div className="border-t border-gray-200"></div>
                    <ul className="list-none p-2">
                        {suggestedMapLocations.map((location, index) => (
                            <li key={index} className="first:pt-0 last:pb-0">
                                <div 
                                    className="p-2 hover:bg-gray-100 cursor-pointer transition duration-200" 
                                    onClick={() => handleSelect(location)}
                                >
                                    {location.descTC} {/* Use the appropriate property you want to display */}
                                </div>
                                {index < suggestedMapLocations.length - 1 && (
                                    <div className="border-t border-gray-200"></div> // Horizontal separator
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MapSearch;