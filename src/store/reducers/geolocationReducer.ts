const initialState = {
    latitude: 22.3204,
    longitude: 114.1698,
}

type Action = { type: "REFRESH_LOCATION", payload: { latitude: number, longitude: number } }

export const geolocationReducer = (state = initialState, action: Action) => {
    switch (action.type) {
        case "REFRESH_LOCATION":
            return {
                latitude: action.payload.latitude,
                longitude: action.payload.longitude,
            }
        default:
            return state
    }
}