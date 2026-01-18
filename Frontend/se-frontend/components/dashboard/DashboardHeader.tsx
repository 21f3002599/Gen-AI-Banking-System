"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { useAuth } from "@/app/context/AuthContext";

const DashboardHeader = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    // Determine page title based on URL
    const getPageTitle = (path: string) => {
        if (path === "/dashboard") return "Overview";
        if (path.includes("/accounts")) return "Accounts";
        if (path.includes("/transactions")) return "Transactions";
        if (path.includes("/deposit")) return "Cash Deposit";
        if (path.includes("/profile")) return "Profile";
        if (path.includes("/chatbot")) return "AI Assistant";
        if (path.includes("/care")) return "Care Dashboard";
        if (path.includes("/analyst")) return "Analyst Dashboard";
        if (path.includes("/clerk")) return "Clerk Dashboard";
        return "Dashboard";
    };

    return (
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 mb-8">
            {/* Page Title */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {getPageTitle(pathname)}
                </h1>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                {/* User Account Info (Visible on Desktop) */}
                <div className="hidden lg:flex flex-col items-end mr-4">
                    <span className="text-sm text-[#24b281] font-medium">{user?.name || "User"}</span>
                    {user?.accountNo && (
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            {user.accountNo}
                        </span>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative hidden md:block">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <Input
                        placeholder="Search"
                        className="pl-10 bg-white border-none rounded-full w-64 shadow-sm"
                    />
                </div>

                {/* Notification Bell */}
                <button className="p-2 relative text-gray-500 hover:text-[#24b281] transition-colors">
                    <Bell size={24} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                    {/* Placeholder for avatar image */}
                    <Image
                        src="/images/dp-1.png" // Using one of your existing images as placeholder avatar
                        alt="User"
                        width={40}
                        height={40}
                        className="object-cover h-full w-full"
                    />
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
