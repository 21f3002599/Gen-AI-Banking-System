"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getTransactions, getDashboardOverview } from "@/lib/api";
import AccountCard from "@/components/dashboard/AccountCard";
import TransactionTableItem from "@/components/dashboard/TransactionTableItem";
import LoadingState from "@/components/ui/LoadingState";
import { Search, Bell } from "lucide-react";

export default function TransactionsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [mainBalance, setMainBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.userId) return;

            try {
                const overview = await getDashboardOverview(user.userId).catch(() => null);

                if (overview) {
                    setMainBalance(overview.balance || 0);
                    if (overview.account_no) {
                        const txs = await getTransactions(overview.account_no).catch(() => []);
                        setTransactions(txs);
                    }
                }
            } catch (error) {
                console.error("Error fetching transaction data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.userId]);

    return (
        <div className="p-4 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto">

            {/* Account Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Account (Real Data) */}
                <AccountCard
                    label="Main Account"
                    balance={mainBalance}
                    subtext={user?.accountNo}
                />
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[500px]">
                {loading ? (
                    <LoadingState />) : (
                    <div className="flex flex-col gap-2">
                        {transactions.length > 0 ? (
                            transactions.map((tx, idx) => (
                                <TransactionTableItem
                                    key={tx.transaction_id || idx}
                                    name={tx.transaction_category?.replace(/_/g, ' ') || "Transfer"}
                                    type={tx.transaction_type === 'credit' ? 'Credit' : 'Debit'}
                                    date={new Date(tx.time || tx.date).toLocaleString([], { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}
                                    amount={tx.amount}
                                    isCredit={tx.transaction_type === 'credit'}
                                    status={
                                        tx.transaction_status === 'success' ? "Completed" :
                                            tx.transaction_status === 'pending' ? "Pending" : "Canceled"
                                    }

                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                No transactions found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
