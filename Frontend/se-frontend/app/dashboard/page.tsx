"use client"
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

// Components
// Components
import BalanceOverviewCard from "@/components/dashboard/BalanceOverviewCard";
import AccountCard from "@/components/dashboard/AccountCard";
import TransactionRow from "@/components/dashboard/TransactionRow";
import OverviewChart from "@/components/dashboard/OverviewChart";
import LoadingState from "@/components/ui/LoadingState";
import SpendingPieChart from "@/components/dashboard/SpendingPieChart";

// API
import {
  getDashboardOverview,
  getTransactions,
  getMonthlyStats,
  getSpendingAnalysis,
} from "@/lib/api";

export default function DashboardOverview() {
  const { user, updateUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userId) {
        return;
      }

      try {
        const [overview, stats, spending] = await Promise.all([
          getDashboardOverview(user.userId).catch(() => null),
          getMonthlyStats().catch(() => []),
          getSpendingAnalysis().catch(() => null),
        ]);

        if (overview) {
          setDashboardData(overview);

          // Update global user context with fetched name and account number
          if (overview.customer_name || overview.account_no) {
            updateUser({
              name: overview.customer_name,
              accountNo: overview.account_no
            });
          }

          // After getting overview, fetch transactions if account exists
          if (overview.account_no) {
            const txsData = await getTransactions(overview.account_no).catch(() => []);
            setTransactions(txsData);
          }
        }

        setMonthlyStats(stats || []);
        setSpendingData(spending);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.userId]);

  // Calculate totals from monthly stats for the Balance Card logic if not provided by overview
  // Assuming monthlyStats is array of { month: string, income: number, expense: number }
  const totalIncome = monthlyStats.reduce((acc, curr) => acc + (curr.credit || 0), 0);
  const totalExpense = monthlyStats.reduce((acc, curr) => acc + (curr.debit || 0), 0);

  // Calculate percentage for StatProgress
  const totalFlow = totalIncome + totalExpense;
  const incomePercentage = totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 0;
  const expensePercentage = totalFlow > 0 ? (totalExpense / totalFlow) * 100 : 0;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* === LEFT COLUMN (3/4 width on large screens) === */}
      <div className="xl:col-span-3 flex flex-col gap-8">

        {/* 1. Balance Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Current Account Balance
            </h2>
            <div className="flex gap-2">
              {/* Add filter/date dropdowns here if needed later */}
            </div>
          </div>
          {dashboardData ? (
            <BalanceOverviewCard
              currentBalance={dashboardData.balance || 0}
              income={totalIncome}
              expense={totalExpense}
            />
          ) : (
            <div className="p-6 bg-red-50 text-red-500 rounded-3xl border border-red-100">
              Unable to load account details.
            </div>
          )}
        </section>

        {/* 2. Accounts Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AccountCard
              label="Main Account"
              subtext={dashboardData?.account_no}
              balance={dashboardData?.balance || 0}
            />
            {/* Example of another account if needed */}
            {/* <AccountCard label="Savings" balance={12000.0} /> */}
          </div>
        </section>

        {/* 3. Statistics Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly Bar Chart */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Monthly Activity
            </h2>
            <div className="bg-white rounded-3xl p-6 h-[400px]">
              <OverviewChart data={monthlyStats} />
            </div>
          </div>

          {/* Spending Analysis Pie Chart */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Spending Analysis
            </h2>
            <div className="bg-white rounded-3xl p-6 h-[400px]">
              {spendingData ? (
                <SpendingPieChart data={spendingData} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No analysis data available
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* === RIGHT COLUMN (1/3 width on large screens) === */}
      <div className="flex flex-col gap-8">
        {/* 4. Transactions List */}
        <section className="bg-white rounded-3xl p-6 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Transactions
            </h2>
            <Link
              href="/dashboard/transactions"
              className="text-[#24b281] hover:opacity-80"
            >
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="flex flex-col">
            {transactions.length > 0 ? (
              transactions.slice(0, 5).map((tx) => (
                <TransactionRow
                  key={tx.transaction_id || Math.random()}
                  name={tx.transaction_category?.replace(/_/g, ' ') || "Transaction"}
                  date={new Date(tx.time || tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                  amount={tx.amount}
                  type={tx.transaction_type === 'credit' ? 'credit' : 'debit'} // Uses API transaction_type
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">No recent transactions</div>
            )}
          </div>
        </section>
      </div>

      {/* Onboarding Overlay */}
      {
        dashboardData &&
        // Check if customer_id is present and different from user.userId
        // We cast dashboardData to any because types might be loose, or we can check property existence
        dashboardData.customer_id &&
        dashboardData.customer_id !== user?.userId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-[#E0F5EC] text-[#24b281] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Incomplete
              </h3>
              <p className="text-gray-600 mb-8">
                It looks like your customer profile isn&apos;t fully linked yet.
                Please complete the registration process with our AI Assistant to
                start using all services.
              </p>
              <Link
                href="/dashboard/chatbot?onboarding=true"
                className="block w-full py-4 bg-[#24b281] hover:bg-[#1ea06f] text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Complete Registration
              </Link>
            </div>
          </div>
        )
      }
    </div>
  );
}
