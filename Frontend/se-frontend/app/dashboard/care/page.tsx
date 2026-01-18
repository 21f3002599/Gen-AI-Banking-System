"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import LoadingState from "@/components/ui/LoadingState";
import GrievancePieChart from "@/components/dashboard/care/GrievancePieChart";
import {
    getGrievances,
    updateGrievanceStatus,
    getGrievanceStats,
    getCustomer360
} from "@/lib/api";

import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Search,
    Sparkles,
    User
} from "lucide-react";
import ProfileCard from "@/components/dashboard/profile/ProfileCard";
import { Button } from "@/components/ui/button";


// ... imports

export default function CareDashboard() {
    // ... state (remove aiSummary)
    const [activeTab, setActiveTab] = useState<"grievances" | "customer">("grievances");
    const [loading, setLoading] = useState(true);

    // Grievance State
    const [grievances, setGrievances] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState("all");

    // Customer 360 State
    const [searchUserId, setSearchUserId] = useState("");
    const [searchedCustomer, setSearchedCustomer] = useState<any>(null);
    const [customerLoading, setCustomerLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [grievanceData, statsData] = await Promise.all([
                    getGrievances(statusFilter).catch(() => []),
                    getGrievanceStats().catch(() => null)
                ]);
                setGrievances(grievanceData);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to load care data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [statusFilter]);

    const handleResolve = async (id: string) => {
        try {
            await updateGrievanceStatus(id, "resolved");
            // Refresh data
            const [grievanceData, statsData] = await Promise.all([
                getGrievances(statusFilter),
                getGrievanceStats()
            ]);
            setGrievances(grievanceData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to resolve grievance", error);
        }
    };

    const handleCustomerSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchUserId.trim()) return;

        setCustomerLoading(true);
        setSearchedCustomer(null);
        try {
            const data = await getCustomer360(searchUserId);
            setSearchedCustomer(data);
        } catch (error) {
            console.error("Failed to search customer", error);
            setSearchedCustomer(null);
        } finally {
            setCustomerLoading(false);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Care Dashboard</h1>
                <Link href="/dashboard/care/ai-insights">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-xl shadow-lg shadow-purple-200">
                        <Sparkles size={18} />
                        View AI Insights
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left Column: Main Content (Tabs) */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100 mb-8 inline-flex">
                        <button
                            onClick={() => setActiveTab("grievances")}
                            className={`py-3 px-6 rounded-2xl text-sm font-bold transition-all duration-200 ${activeTab === "grievances"
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            Grievance Management
                        </button>
                        <button
                            onClick={() => setActiveTab("customer")}
                            className={`py-3 px-6 rounded-2xl text-sm font-bold transition-all duration-200 ${activeTab === "customer"
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            Customer 360°
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "grievances" ? (
                        <div className="flex flex-col gap-6">
                            {/* Filters */}
                            <div className="flex gap-2 mb-2">
                                {["all", "pending", "resolved"].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${statusFilter === filter
                                            ? "bg-gray-900 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            {/* Grievance List */}
                            <div className="grid grid-cols-1 gap-4">
                                {grievances.length > 0 ? (
                                    grievances.map((g: any) => (
                                        <div key={g.grievance_id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 transition-all hover:shadow-md">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${g.status === 'resolved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {g.status}
                                                    </span>
                                                    <span className="text-gray-400 text-xs font-mono">ID: {g.grievance_id.slice(0, 8)}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">{g.category}</h3>
                                                <p className="text-gray-600 text-sm mb-3">{g.description}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <User size={14} />
                                                    <span>{g.customer_name}</span>
                                                </div>
                                            </div>

                                            {g.status !== "resolved" && (
                                                <div className="flex items-center">
                                                    <Button
                                                        onClick={() => handleResolve(g.grievance_id)}
                                                        className="bg-[#24b281] hover:bg-[#1ea070] text-white rounded-xl"
                                                    >
                                                        Mark Resolved
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        No grievances found.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Search Bar */}
                            <form onSubmit={handleCustomerSearch} className="flex gap-4 max-w-lg bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter User ID..."
                                        value={searchUserId}
                                        onChange={(e) => setSearchUserId(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-none focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                                <Button type="submit" disabled={customerLoading} className="bg-gray-900 text-white h-auto rounded-xl px-6 hover:bg-gray-800">
                                    {customerLoading ? "Searching..." : "Search"}
                                </Button>
                            </form>

                            {/* Result */}
                            {searchedCustomer ? (
                                <div className="mt-4">
                                    <ProfileCard user={{
                                        name: searchedCustomer.customer_name,
                                        email: searchedCustomer.email || "N/A",
                                        phone: searchedCustomer.mobile_no || "N/A",
                                        gender: searchedCustomer.gender || "N/A",
                                        dob: searchedCustomer.dob || "N/A",
                                        address: searchedCustomer.address || "N/A",
                                        avatarUrl: searchedCustomer.customer_image_url || "/images/dp-1.png",
                                        isPro: false
                                    }} />
                                </div>
                            ) : (
                                !customerLoading && (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <Search size={48} className="mb-4 opacity-20" />
                                        <p>Enter a User ID to view 360° details</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Stats Sidebar */}
                {stats && (
                    <div className="w-full xl:w-96 flex flex-col gap-6 shrink-0">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total</span>
                                <span className="text-4xl font-black text-gray-900">{stats.total}</span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending</span>
                                <span className="text-4xl font-black text-yellow-500">{stats.pending}</span>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2 col-span-2">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Resolved</span>
                                <span className="text-4xl font-black text-[#24b281]">{stats.resolved}</span>
                            </div>
                        </div>

                        {/* Chart Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                            <h2 className="text-lg font-bold text-gray-800 mb-2">Issue Distribution</h2>
                            <div className="flex-1 min-h-0">
                                <GrievancePieChart data={stats.category_stats} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
