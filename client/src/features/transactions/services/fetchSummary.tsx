export interface AccountSummary {
    account: string;
    balance: string;
    total_inflow: string;
    total_outflow: string;
}

export async function fetchSummary(startDate?: string, endDate?: string): Promise<AccountSummary[]> {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`api/transactions/summary/by-account${query}`, {
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
