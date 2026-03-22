export async function fetchTransactions() {
    const response = await fetch(`api/transactions`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return response.json();
}
