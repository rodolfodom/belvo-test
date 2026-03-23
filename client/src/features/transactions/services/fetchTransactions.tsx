export async function fetchTransactions() {
    const response = await fetch(`api/transactions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    if (response.status === 401 || response.status === 403) {
        throw new Error("UNAUTHORIZED");
    }
    return response.json();
}
