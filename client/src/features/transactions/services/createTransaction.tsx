export async function createTransaction(reference: string, account: string, type: string, category: string, amount: number, date: string) {
    if(type === "outflow" && amount > 0) {
        amount = -amount;
    }
    const response = await fetch(`api/transactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ reference, account, type, category, amount, date }),
    });
    return response;
}