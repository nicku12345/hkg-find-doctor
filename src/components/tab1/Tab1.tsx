import React from 'react';

const dummyText = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`

export const Tab1: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to Tab1!</h1>
            {
                Array.from({ length: 100 }, (_, i) => {
                    return <p className="text-lg mb-2">{dummyText}</p>
                })
            }
        </div>
    );
};