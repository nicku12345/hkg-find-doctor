const initialState: { error: string | null, warning: string | null } = {
    error: null,
    warning: null,
}

export type Action =
    { type: "SET_ERROR"; payload: { error: string | null } }
    | { type: "SET_WARNING"; payload: { warning: string | null } }

export const errorReducer = (state = initialState, action: Action): (typeof initialState) => {
    switch (action.type) {
        case "SET_ERROR":
            return { ...state, error: action.payload.error }
        
        case "SET_WARNING":
            return { ...state, warning: action.payload.warning }
        
        default:
            return state
    }
}