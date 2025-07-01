
const initialState: { error: string | null } = {
    error: null
}

type Action = { type: "SET_ERROR"; payload: { error: string | null } }

export const errorReducer = (state = initialState, action: Action): (typeof initialState) => {
    switch (action.type) {
        case "SET_ERROR":
            return { error: action.payload.error }
        
        default:
            return state
    }
}