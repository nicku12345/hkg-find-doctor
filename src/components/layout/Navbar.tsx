import React from "react";
import { TabId } from "./Tab.tsx";
import { useDispatch } from "react-redux";

export const Navbar: React.FC = () => {
    const dispatch = useDispatch()
    const handleClick = (tabId: TabId) => {
        dispatch({ type: "SET_TAB", payload: { id: tabId } })
    }
    return (
        <nav className="bg-gray-500 p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-lg font-semibold">
                    Nicku UI Template
                </div>
                <div className="flex space-x-4">
                    {
                        Object.values(TabId)
                            .map(tabId => (
                                <button
                                    className="text-white hover:bg-gray-700 px-3 py-2 rounded"
                                    onClick={() => handleClick(tabId)}
                                >
                                    {tabId}
                                </button>
                            ))
                    }
                </div>
            </div>
        </nav>
    )
}