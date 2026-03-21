const API_URL = import.meta.env.VITE_API_URL;

export async function createTransaction(account: string, type: string, category: string, amount: number, date: string) {
    if(type === "outflow" && amount > 0) {
        amount = -amount;
    }
    const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ account, type, category, amount, date }),
    });
    return response;
}