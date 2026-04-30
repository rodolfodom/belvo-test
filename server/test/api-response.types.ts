export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  name: string;
  email: string;
}

export interface TransactionResponse {
  reference: string;
  account: string;
  date: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
}

export interface AccountSummaryResponse {
  account: string;
  balance: string;
  total_inflow: string;
  total_outflow: string;
}
