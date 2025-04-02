import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const useNavigation = () => {
    const location = useLocation(); // Replaces usePathname
    const pathname = location.pathname;

    const [state, setState] = useState({
        isELDlogsActive: false,
        isMapActive: false,
    });

    useEffect(() => {
        const updateState = (key: string, path: string) => {
            setState(prevState => ({
                ...prevState,
                [key]: pathname==path,
            }));
        };

        updateState("isELDlogsActive", "/");
        updateState("isMapActive", "/map");

    }, [pathname]);

    return state;
};

export default useNavigation;
