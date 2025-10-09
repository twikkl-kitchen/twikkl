import { fetchFromApi, handleFetchError } from "@twikkl/utils/fetch";

export interface WalletData {
  address: string;
  balance: string;
  chain: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: string;
  from: string;
  to: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

export const getWalletInfo = async () => {
  try {
    const { data } = await fetchFromApi({
      path: "wallet/info",
      method: "get",
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const getWalletBalance = async (chain?: string) => {
  try {
    const { data } = await fetchFromApi({
      path: "wallet/balance",
      method: "get",
      params: chain ? { chain } : undefined,
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};

export const getWalletTransactions = async (limit: number = 10, chain?: string) => {
  try {
    const { data } = await fetchFromApi({
      path: "wallet/transactions",
      method: "get",
      params: chain ? { limit, chain } : { limit },
    });
    return data;
  } catch (error) {
    handleFetchError(error);
    throw error;
  }
};
