type MapState = {
    latitude: number,
    longitude: number,

    selectedLocationDesc: string,
    filteredDistrict: string,

    mapCenterFlag: boolean,
}

const initialState: MapState = {
    latitude: 22.3204,
    longitude: 114.1698,

    selectedLocationDesc: "",
    filteredDistrict: "",

    mapCenterFlag: true,
}

export type Action =
    { type: "REFRESH_LOCATION", payload: { latitude: number, longitude: number } }
    | { type: "SET_SELECTED_LOCATION", payload: { selectedLocationDesc: string } }
    | { type: "SET_FILTERED_DISTRICT", payload: { filteredDistrict: string } }
    | { type: "TOGGLE_MAP_CENTER_FLAG" }

export const geolocationReducer = (state = initialState, action: Action): MapState => {
    switch (action.type) {
        case "REFRESH_LOCATION":
            return {
                ...state,
                latitude: action.payload.latitude,
                longitude: action.payload.longitude,
            }
        
        case "SET_SELECTED_LOCATION":
            return {
                ...state,
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
                mapCenterFlag: !state.mapCenterFlag
            }
        default:
            return state
    }
}