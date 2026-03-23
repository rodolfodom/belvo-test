import { useNavigate } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../../features/auth/context/AuthContext";

export function useHandleAuthError() {
    const navigate = useNavigate();
    const { clearAuthData } = useContext(AuthContext);

    return () => {
        clearAuthData();
        navigate("/");
    };
}
