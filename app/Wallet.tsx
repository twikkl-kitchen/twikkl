import { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getWalletInfo, getWalletBalance, getWalletTransactions, WalletData, Transaction } from "@twikkl/services";

export default function Wallet(): ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChain, setActiveChain] = useState("ethereum");

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (walletData) {
      fetchChainData();
    }
  }, [activeChain, walletData?.address]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const walletInfo = await getWalletInfo();
      setWalletData(walletInfo);
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      setError("Unable to load wallet. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChainData = async () => {
    
    try {
      const [balance, txHistory] = await Promise.all([
        getWalletBalance(activeChain),
        getWalletTransactions(10, activeChain),
      ]);
      
      setWalletData((prev) => ({
        ...prev,
        address: prev?.address || "",
        balance: balance?.balance || "0.00",
        chain: activeChain,
      }));
      
      if (Array.isArray(txHistory)) {
        setTransactions(txHistory);
      } else if (txHistory?.transactions) {
        setTransactions(txHistory.transactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeChain} data:`, error);
      setError(`Unable to load ${activeChain} data. Please try again.`);
    }
  };

  const copyAddress = () => {
    if (walletData?.address) {
      Clipboard.setString(walletData.address);
      Alert.alert("Copied!", "Wallet address copied to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toFixed(4);
  };

  const chainOptions = [
    { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "diamond-outline" as const },
    { id: "solana", name: "Solana", symbol: "SOL", icon: "sunny-outline" as const },
    { id: "polygon", name: "Polygon", symbol: "MATIC", icon: "git-network-outline" as const },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#50a040" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  if (error && !walletData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWalletData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.inlineError}>
            <Ionicons name="alert-circle" size={20} color="#ff4444" />
            <Text style={styles.inlineErrorText}>{error}</Text>
            <TouchableOpacity onPress={fetchChainData} style={styles.inlineRetryButton}>
              <Ionicons name="reload" size={16} color="#50a040" />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ${walletData?.balance || "0.00"}
          </Text>

          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {walletData?.address ? formatAddress(walletData.address) : "No wallet connected"}
            </Text>
            <TouchableOpacity onPress={copyAddress} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={18} color="#50a040" />
            </TouchableOpacity>
          </View>

          <View style={styles.chainSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {chainOptions.map((chain) => (
                <TouchableOpacity
                  key={chain.id}
                  style={[
                    styles.chainChip,
                    activeChain === chain.id && styles.chainChipActive,
                  ]}
                  onPress={() => setActiveChain(chain.id)}
                >
                  <Ionicons
                    name={chain.icon}
                    size={16}
                    color={activeChain === chain.id ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.chainText,
                      activeChain === chain.id && styles.chainTextActive,
                    ]}
                  >
                    {chain.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="arrow-up" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="arrow-down" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="swap-horizontal" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Swap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.transactionItem}>
                <View
                  style={[
                    styles.txIconContainer,
                    tx.type === "send" ? styles.txSend : styles.txReceive,
                  ]}
                >
                  <Ionicons
                    name={tx.type === "send" ? "arrow-up" : "arrow-down"}
                    size={16}
                    color="#fff"
                  />
                </View>

                <View style={styles.txDetails}>
                  <Text style={styles.txType}>
                    {tx.type === "send" ? "Sent" : "Received"}
                  </Text>
                  <Text style={styles.txAddress}>
                    {tx.type === "send" ? `To: ${formatAddress(tx.to)}` : `From: ${formatAddress(tx.from)}`}
                  </Text>
                </View>

                <View style={styles.txAmount}>
                  <Text
                    style={[
                      styles.txAmountText,
                      tx.type === "send" ? styles.txNegative : styles.txPositive,
                    ]}
                  >
                    {tx.type === "send" ? "-" : "+"}${formatAmount(tx.amount)}
                  </Text>
                  <Text style={styles.txStatus}>{tx.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#50a040",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inlineError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff4444",
    gap: 8,
  },
  inlineErrorText: {
    flex: 1,
    color: "#ff4444",
    fontSize: 14,
  },
  inlineRetryButton: {
    padding: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#000",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#1a1a1a",
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontFamily: "monospace",
  },
  copyButton: {
    padding: 4,
  },
  chainSelector: {
    marginTop: 8,
  },
  chainChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  chainChipActive: {
    backgroundColor: "#50a040",
  },
  chainText: {
    color: "#666",
    fontSize: 14,
  },
  chainTextActive: {
    color: "#fff",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#50a040",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
  },
  transactionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txSend: {
    backgroundColor: "#ff4444",
  },
  txReceive: {
    backgroundColor: "#50a040",
  },
  txDetails: {
    flex: 1,
  },
  txType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  txAddress: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
  },
  txAmount: {
    alignItems: "flex-end",
  },
  txAmountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  txPositive: {
    color: "#50a040",
  },
  txNegative: {
    color: "#ff4444",
  },
  txStatus: {
    fontSize: 12,
    color: "#999",
    textTransform: "capitalize",
  },
});
