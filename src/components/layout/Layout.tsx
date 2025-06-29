import React from "react";
import { Navbar } from "./Navbar.tsx";
import { Footer } from "./Footer.tsx";


interface LayoutProps {
    children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="bg-gray-200">
            <div className="max-w-[650px] mx-auto min-h-screen max-w-2xl mx-auto bg-white shadow-md rounded-lg">
                <div className="flex flex-col min-h-screen">
                    <Navbar/>
                    <div className="flex-grow">
                        {children}
                    </div>
                    <Footer/>
                </div>
            </div>
        </div>
    )
}