interface Transaction {
    id: number;
    reference: string;
    account: string;
    amount: number;
    date: string; // YYYY-MM-DD
    type: "inflow" | "outflow";
}

export type { Transaction };