import { createContext } from "react";

interface AuthContextType {
    name: string | null;
    email: string | null;
    setAuthData: (data: { name: string; email: string }) => void;
    clearAuthData: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    name: null,
    email: null,
    setAuthData: () => {},
    clearAuthData: () => {},
});
