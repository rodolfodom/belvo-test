type TransactionPayload = {
    account: string;
    type: string;
    category: string;
    amount: number;
    date: string;
};

export async function createTransactions(transactions: TransactionPayload[]) {
    const payload = transactions.map((t) => ({
        ...t,
        amount: t.type === "outflow" && t.amount > 0 ? -t.amount : t.amount,
    }));

    const response = await fetch(`api/transactions/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
    });
    return response;
}
