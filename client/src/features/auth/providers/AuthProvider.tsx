import { useState, type ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const setAuthData = (data: { name: string; email: string; accessToken: string }) => {
        setName(data.name);
        setEmail(data.email);
        // store token in localStorage or any other storage if needed
        localStorage.setItem("accessToken", data.accessToken);
    };

    const clearAuthData = () => {
        setName(null);
        setEmail(null);
        // remove token from localStorage or any other storage if needed
        localStorage.removeItem("accessToken");
    };

    return (
        <AuthContext.Provider value={{ name, email, setAuthData, clearAuthData }}>
            {children}
        </AuthContext.Provider>
    );
};