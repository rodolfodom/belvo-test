import { useState, type ReactNode } from "react";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [name, setName] = useState<string | null>(localStorage.getItem("name"));
    const [email, setEmail] = useState<string | null>(localStorage.getItem("email"));

    const setAuthData = (data: { name: string; email: string; accessToken: string }) => {
        setName(data.name);
        setEmail(data.email);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
    };

    const clearAuthData = () => {
        setName(null);
        setEmail(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
    };

    return (
        <AuthContext.Provider value={{ name, email, setAuthData, clearAuthData }}>
            {children}
        </AuthContext.Provider>
    );
};