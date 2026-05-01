export type CategorySummary = Record<string, Record<string, string>>;

export async function fetchSummaryByCategory(): Promise<CategorySummary> {
    const response = await fetch("api/transactions/summary/by-category", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    if (response.status === 401 || response.status === 403) {
        throw new Error("UNAUTHORIZED");
    }
    return response.json();
}
