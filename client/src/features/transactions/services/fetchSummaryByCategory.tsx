export type CategorySummary = Record<string, Record<string, string>>;

export async function fetchSummaryByCategory(): Promise<CategorySummary> {
    const response = await fetch("api/transactions/summary/by-category", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
    });
    return response.json();
}
