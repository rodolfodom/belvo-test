export async function signUp(email: string, password: string, name: string) {
    const response = await fetch(`api/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
    });
    return response;
}