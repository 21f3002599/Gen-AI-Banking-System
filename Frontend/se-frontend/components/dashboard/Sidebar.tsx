"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    CreditCard,
    ArrowRightLeft,
    User,
    LogOut,
    Bot,
    PiggyBank,
    LifeBuoy,
    ShieldAlert,
    ClipboardList,
} from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import { ROLES } from "@/lib/roles";

const Sidebar = () => {
    const { user } = useAuth();
    const pathname = usePathname();

    const allLinks = [
        {
            name: "Overview",
            href: "/dashboard",
            icon: LayoutGrid,
            roles: [ROLES.CUSTOMER.id, ROLES.CUSTOMER.name],
        },
        {
            name: "Transactions",
            href: "/dashboard/transactions",
            icon: ArrowRightLeft,
            roles: [ROLES.CUSTOMER.id, ROLES.CUSTOMER.name],
        },
        {
            name: "Deposit",
            href: "/dashboard/deposit",
            icon: PiggyBank,
            roles: [ROLES.CUSTOMER.id, ROLES.CUSTOMER.name],
        },
        {
            name: "AI Assistant",
            href: "/dashboard/chatbot",
            icon: Bot,
            roles: [ROLES.CUSTOMER.id, ROLES.CUSTOMER.name],
        },
        {
            name: "Care Dashboard",
            href: "/dashboard/care",
            icon: LifeBuoy,
            roles: [ROLES.CARE.id, ROLES.CARE.name], // Only for Care
        },
        {
            name: "Profile",
            href: "/dashboard/profile",
            icon: User,
            roles: [ROLES.CUSTOMER.id, ROLES.CUSTOMER.name],
        },
        {
            name: "Analyst Dashboard",
            href: "/dashboard/analyst",
            icon: ShieldAlert,
            roles: [ROLES.ANALYST.id, ROLES.ANALYST.name],
        },
        {
            name: "Clerk Dashboard",
            href: "/dashboard/clerk",
            icon: ClipboardList,
            roles: [ROLES.CLERK.id, ROLES.CLERK.name],
        },
    ];

    const navLinks = allLinks.filter(link => {
        if (!user) return false;

        if (link.roles) {
            // Case: User has a specific role
            if (user.role) {
                // Strict check: User must have the required role
                return link.roles.includes(user.role as any);
            }
            // Case: User has NO role (Standard Customer) -> Show only 'customer' links
            return link.roles.includes(ROLES.CUSTOMER.name) || link.roles.includes(ROLES.CUSTOMER.id);
        }
        return true;
    });

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 z-50">
            {/* Logo Section */}
            <div className="p-8">
                <Logo />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-2 px-4 mt-4">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                isActive
                                    ? "text-[#24b281] bg-[#24b281]/10" // Active state: Green text + Light green BG
                                    : "text-gray-500 hover:text-[#24b281] hover:bg-gray-50", // Inactive state
                            )}
                        >
                            <link.icon size={22} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Section */}
            <div className="p-4 mb-4">
                <Link
                    href="/login"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                    <LogOut size={22} />
                    <span>Logout</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
