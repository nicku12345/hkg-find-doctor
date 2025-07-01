import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store.ts";
import { Map } from "../Map/Map.tsx";

export enum TabId {
    Map = "️Map"
}

export interface TabProps {
    id: TabId
}

export const Tab: React.FC = () => {
    const tabState = useSelector((state: RootState) => state.tab)
    switch (tabState.id) {
        case TabId.Map:
            return <Map/>
   }
}