import type { RootState } from "../../store/store.ts";
import { useSelector } from 'react-redux';
import { useState } from 'react';

export const Error: React.FC = () => {
    const { error, warning } = useSelector((state: RootState) => state.error);
    const [showError, setShowError] = useState(true);
    const [showWarning, setShowWarning] = useState(true);

    const handleCloseError = () => {
        setShowError(false);
    };

    const handleCloseWarning = () => {
        setShowWarning(false);
    };

    return (
        <div>
            {showError && error !== null && (
                <div className="m-1 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 flex items-center justify-between relative">
                    <div className="flex-1">
                        <strong>❌</strong> {error}
                    </div>
                    <button 
                        onClick={handleCloseError} 
                        className="text-red-700 hover:text-red-900"
                    >
                        <img 
                            src="map/close-window.png" 
                            alt="Close" 
                            className="h-6 w-6 object-cover rounded"
                        />
                    </button>
                </div>
            )}
            {showWarning && warning !== null && (
                <div className="m-1 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded flex items-center justify-between relative">
                    <div className="flex-1">
                        <strong>ℹ️</strong> {warning}
                    </div>
                    <button 
                        onClick={handleCloseWarning} 
                        className="text-yellow-700 hover:text-yellow-900"
                    >
                        <img 
                            src="map/close-window.png" 
                            alt="Close" 
                            className="h-6 w-6 object-cover rounded"
                        />
                    </button>
                </div>
            )}
        </div>
    );
}