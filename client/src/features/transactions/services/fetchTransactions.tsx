const API_URL = import.meta.env.VITE_API_URL;

export async function fetchTransactions() {
    const response = await fetch(`${API_URL}/transactions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return response.json();
}
