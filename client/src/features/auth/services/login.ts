export async function login(email: string, password: string) {
    const response = await fetch(`api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    return response;
}