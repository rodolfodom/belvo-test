const API_URL = import.meta.env.VITE_API_URL;

export async function signUp(email: string, password: string, name: string) {
    const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
    });
    return response;
}