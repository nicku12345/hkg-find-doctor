type MapState = {
    latitude: number,
    longitude: number,

    centerLatitude: number,
    centerLongitude: number,
    zoom: number,

    selectedLocationDesc: string,
    filteredDistrict: string,

    mapCenterFlag: boolean,
}

const GEOLOCATION_MAX_ZOOM = 20

const initialState: MapState = {
    latitude: 22.3204,  // default is MONG KOK
    longitude: 114.1698,

    centerLatitude: 22.3204,
    centerLongitude: 114.1698,
    zoom: GEOLOCATION_MAX_ZOOM,

    selectedLocationDesc: "",
    filteredDistrict: "",

    mapCenterFlag: true,
}

export type Action =
    { type: "REFRESH_LOCATION", payload: { latitude: number, longitude: number } }
    | { type: "SET_SELECTED_LOCATION", payload: { selectedLocationDesc: string } }
    | { type: "SET_FILTERED_DISTRICT", payload: { filteredDistrict: string } }
    | { type: "TOGGLE_MAP_CENTER_FLAG", payload?: { centerLatitude: number, centerLongitude: number } }

export const geolocationReducer = (state = initialState, action: Action): MapState => {
    switch (action.type) {
        case "REFRESH_LOCATION":
            return {
                ...state,
                centerLatitude: action.payload.latitude,
                centerLongitude: action.payload.longitude,
                zoom: GEOLOCATION_MAX_ZOOM,
                mapCenterFlag: !state.mapCenterFlag,
                latitude: action.payload.latitude,
                longitude: action.payload.longitude,
            }
        
        case "SET_SELECTED_LOCATION":
            return {
                ...state,
                zoom: GEOLOCATION_MAX_ZOOM,
                mapCenterFlag: !state.mapCenterFlag,
                selectedLocationDesc: action.payload.selectedLocationDesc
            }

        case "SET_FILTERED_DISTRICT":
            return {
                ...state,
                filteredDistrict: action.payload.filteredDistrict
            }

        case "TOGGLE_MAP_CENTER_FLAG":
            return {
                ...state,
                zoom: GEOLOCATION_MAX_ZOOM,
                ...(action.payload ? {
                    centerLatitude: action.payload.centerLatitude,
                    centerLongitude: action.payload.centerLongitude,
                } : {}),
                mapCenterFlag: !state.mapCenterFlag
            }
        
        default:
            return state
    }
}