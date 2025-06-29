import React from "react";
import { useSelector } from "react-redux";
import { Tab1 } from "../tab1/Tab1.tsx";
import { Tab2 } from "../tab2/Tab2.tsx";
import type { RootState } from "../../store/store.ts";

export enum TabId {
    Tab1 = "Tab 1",  // stringified names are displayed on the UI
    Tab2 = "Tab 2",
}

export interface TabProps {
    id: TabId
}

export const Tab: React.FC = () => {
    const tabState = useSelector((state: RootState) => state.tab)
    switch (tabState.id) {
        case TabId.Tab1:
            return <Tab1/>

        case TabId.Tab2:
            return <Tab2/>
   }
}