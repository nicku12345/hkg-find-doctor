import { TabId } from "../../components/layout/Tab.tsx";

const initialState = {
    id: TabId.Tab1
}

type Action = { type: "SET_TAB"; payload: { id: TabId } }

const tabReducer = (state = initialState, action: Action): (typeof initialState) => {
    switch (action.type) {
        case "SET_TAB":
            return { id: action.payload.id }
        
        default:
            return state
    }
}

export default tabReducer