export interface AccountSummary {
    account: string;
    balance: string;
    total_inflow: string;
    total_outflow: string;
}

export async function fetchSummary(): Promise<AccountSummary[]> {
    const response = await fetch(`api/transactions/summary/by-account`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return response.json();
}
