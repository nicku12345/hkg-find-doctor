
import type { RootState } from "../../store/store.ts";
import { useSelector } from 'react-redux';

    
export const Error: React.FC = () => {
    const { error } = useSelector((state: RootState) => state.error);
    return (
        error !== null ? <div>Error: {error}</div> : null
    )
}