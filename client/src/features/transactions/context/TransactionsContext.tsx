import { createContext } from "react";
import { type Transaction } from "../types/trasaction.type";

interface TransactionsContextType {
    transactions: Transaction[];
    getTransactions: () => void;
    isLoading: boolean;
    error: string | null;
}

export const TransactionsContext = createContext<TransactionsContextType>({
    transactions: [],
    getTransactions: () => {},
    isLoading: false,
    error: null,
}); 