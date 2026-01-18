"use client";

import React, { useEffect, useState } from "react";
import LoadingState from "@/components/ui/LoadingState";
import {
    ShieldAlert,
    Search,
    Ban,
    CheckCircle,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    getAnalystStats,
    getAnalystAlerts,
    blockAccount,
    unblockAccount,
    getAnalystBlockedAccounts,
    searchAnalystAccount,
    downloadDailyReport
} from "@/lib/api";
import AnalystPieChart from "@/components/dashboard/analyst/AnalystCharts";
import TransactionAnalysisModal from "@/components/dashboard/analyst/TransactionAnalysisModal";

export default function AnalystDashboard() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"alerts" | "management">("alerts");

    // Data State
    const [stats, setStats] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [blockedAccounts, setBlockedAccounts] = useState<any[]>([]);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Modal State
    const [selectedAlert, setSelectedAlert] = useState<any>(null);

    // Report State
    const [downloadingReport, setDownloadingReport] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsData, alertsData, blockedData] = await Promise.all([
                getAnalystStats().catch(() => ({ total_accounts: 0, blocked_accounts: 0, alerts_today: 0 })),
                getAnalystAlerts().catch(() => []),
                getAnalystBlockedAccounts().catch(() => [])
            ]);
            setStats(statsData);
            setAlerts(alertsData);
            setBlockedAccounts(blockedData);
        } catch (error) {
            console.error("Failed to load analyst data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        setDownloadingReport(true);
        try {
            const blob = await downloadDailyReport();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `daily-alerts-${new Date().toISOString().split('T')[0]}.pdf`; // Assuming PDF or similar
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download report.");
        } finally {
            setDownloadingReport(false);
        }
    };

    const handleBlock = async (accountNo: string) => {
        if (!confirm(`Are you sure you want to BLOCK account ${accountNo}?`)) return;
        try {
            await blockAccount(accountNo, "Manual block by analyst");
            alert("Account blocked successfully.");
            fetchDashboardData(); // Refresh
        } catch (error) {
            console.error("Block failed", error);
            alert("Failed to block account.");
        }
    };

    const handleUnblock = async (accountNo: string) => {
        if (!confirm(`Are you sure you want to UNBLOCK account ${accountNo}?`)) return;
        try {
            await unblockAccount(accountNo);
            alert("Account unblocked successfully.");
            fetchDashboardData(); // Refresh
        } catch (error) {
            console.error("Unblock failed", error);
            alert("Failed to unblock account.");
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        try {
            const data = await searchAnalystAccount(searchQuery);
            setSearchResult(data);
        } catch (error) {
            console.error("Search failed", error);
            setSearchResult(null);
        } finally {
            setSearchLoading(false);
        }
    };

    // Derived State
    const [statsData, setStatsData] = useState<any[]>([]);

    useEffect(() => {
        if (stats) {
            setStatsData([
                { name: 'Active', value: stats.total_accounts - stats.blocked_accounts },
                { name: 'Blocked', value: stats.blocked_accounts },
            ]);
        }
    }, [stats]);

    const riskData = [
        { name: 'High Risk', value: alerts.filter(a => a.risk_score > 0.7).length + 2 },
        { name: 'Medium Risk', value: alerts.filter(a => a.risk_score <= 0.7 && a.risk_score > 0.4).length + 5 },
    ];

    if (loading) return <LoadingState />;

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex flex-col xl:flex-row gap-8">
                {/* LEFT COLUMN: Main Content (Alerts & Management) */}
                <div className="flex-1 flex flex-col gap-8 order-2 xl:order-1">
                    {/* Tabs & Actions */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-0">
                        <div className="flex gap-4">
                            <TabButton active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")}>
                                Suspecious Alerts
                                {alerts.length > 0 && (
                                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                        {alerts.length}
                                    </span>
                                )}
                            </TabButton>
                            <TabButton active={activeTab === "management"} onClick={() => setActiveTab("management")}>
                                Account Management
                            </TabButton>
                        </div>
                        <Button
                            onClick={handleDownloadReport}
                            disabled={downloadingReport}
                            variant="outline"
                            className="mb-2 gap-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                        >
                            <Download size={14} />
                            {downloadingReport ? 'Downloading...' : 'Daily Report'}
                        </Button>
                    </div>

                    {/* Content Area */}
                    {activeTab === "alerts" ? (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <ShieldAlert className="text-red-500" />
                                Suspicious Transactions
                            </h2>

                            {alerts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-sm text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="pb-4 pl-4 font-medium">Risk Score</th>
                                                <th className="pb-4 font-medium">Account</th>
                                                <th className="pb-4 font-medium">Type</th>
                                                <th className="pb-4 font-medium">Message</th>
                                                <th className="pb-4 font-medium text-right pr-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {alerts.map((alert: any) => (
                                                <tr key={alert.alert_id} className="border-b border-gray-50 last:border-none hover:bg-gray-50">
                                                    <td className="py-4 pl-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${alert.risk_score > 0.8 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {(alert.risk_score * 100).toFixed(0)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 font-mono">{alert.account_no}</td>
                                                    <td className="py-4 font-medium">{alert.alert_type}</td>
                                                    <td className="py-4 text-gray-600">{alert.alert_message}</td>
                                                    <td className="py-4 text-right pr-4">
                                                        <Button
                                                            onClick={() => setSelectedAlert(alert)}
                                                            className="h-8 bg-gray-900 text-white text-xs hover:bg-gray-800"
                                                        >
                                                            View Details
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-green-500" />
                                    <p>No active alerts. System is secure.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {/* Account Search */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Search className="text-blue-500" />
                                    Account Investigation
                                </h2>
                                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        placeholder="Enter Account Number..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Button type="submit" disabled={searchLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                        {searchLoading ? '...' : 'Search'}
                                    </Button>
                                </form>

                                {searchResult && (Array.isArray(searchResult) ? searchResult : [searchResult]).map((result: any) => (
                                    <div key={result.account_no} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 last:mb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={result.customer_image_url || "/images/dp-1.png"}
                                                    alt={result.customer_name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="font-bold text-lg">{result.customer_name}</h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Account No:</span>
                                                <span className="font-mono">{result.account_no}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={`font-bold ${result.status === 'blocked' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {(result.status || 'unknown').toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Balance:</span>
                                                <span className="font-mono font-bold">₹{(result.balance || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                                {result.status !== 'blocked' ? (
                                                    <Button
                                                        onClick={() => handleBlock(result.account_no)}
                                                        variant="destructive"
                                                        className="w-full"
                                                    >
                                                        Block Account
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleUnblock(result.account_no)}
                                                        className="bg-gray-900 text-white w-full"
                                                    >
                                                        Unblock Account
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Blocked Accounts List */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Ban className="text-red-500" />
                                    Blocked Accounts
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {blockedAccounts.map((account: any) => (
                                        <div key={account.account_no} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <div className="font-bold text-gray-900">{account.customer_name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{account.account_no}</div>
                                                <div className="text-xs text-red-500 mt-1">{account.block_reason}</div>
                                            </div>
                                            <Button
                                                onClick={() => handleUnblock(account.account_no)}
                                                className="bg-gray-900 text-white h-8 text-xs"
                                            >
                                                Unblock
                                            </Button>
                                        </div>
                                    ))}
                                    {blockedAccounts.length === 0 && (
                                        <p className="text-gray-400 text-sm text-center py-8">No blocked accounts.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Sidebar (Stats & Charts) */}
                <div className="w-full xl:w-[400px] flex flex-col gap-6 order-1 xl:order-2">
                    {/* Stats Cards Vertical Stack */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">Total</span>
                            <span className="text-3xl font-black text-blue-600">{stats?.total_accounts || 0}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">Blocked</span>
                            <span className="text-3xl font-black text-red-600">{stats?.blocked_accounts || 0}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">Alerts</span>
                            <span className="text-3xl font-black text-yellow-500">{stats?.alerts_today || 0}</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">System</span>
                            <span className="text-xl font-black text-green-500">Active</span>
                        </div>
                    </div>

                    {/* Charts */}
                    <AnalystPieChart
                        title="Risk Level Distribution"
                        data={riskData}
                        type="risk"
                    />
                    <AnalystPieChart
                        title="Account Status"
                        data={statsData}
                        type="status"
                    />
                </div>
            </div>

            {selectedAlert && (
                <TransactionAnalysisModal
                    alert={selectedAlert}
                    onClose={() => setSelectedAlert(null)}
                    onBlockSuccess={() => {
                        fetchDashboardData();
                    }}
                />
            )}
        </div>
    );
}

function TabButton({ children, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`pb-3 px-4 text-sm font-bold transition-all ${active
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
                }`}
        >
            {children}
        </button>
    );
}
