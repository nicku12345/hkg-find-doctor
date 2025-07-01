import { TabId } from "../../components/Layout/Tab.tsx";

const initialState = {
    id: TabId.Map
}

type Action = { type: "SET_TAB"; payload: { id: TabId } }

export const tabReducer = (state = initialState, action: Action): (typeof initialState) => {
    switch (action.type) {
        case "SET_TAB":
            return { id: action.payload.id }
        
        default:
            return state
    }
}