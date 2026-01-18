"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bot, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatbotFloatingButton = () => {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show the button if we are already on the chatbot page
    if (pathname === "/dashboard/chatbot") return null;

    return (
        <button
            onClick={() => router.push("/dashboard/chatbot")}
            className={cn(
                "fixed bottom-8 right-8 z-50 group flex items-center justify-center",
                "bg-[#24b281] hover:bg-[#1ea06f] text-white",
                "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110",
            )}
            aria-label="Open AI Assistant"
        >
            {/* Icon Container */}
            <div className="relative">
                <Bot
                    size={28}
                    className="transition-transform duration-300 group-hover:rotate-12"
                />

                {/* Little notification dot effect */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
            </div>

            {/* Tooltip / Label appearing on hover */}
            <span className="absolute right-16 bg-white text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Ask AI Assistant
            </span>
        </button>
    );
};

export default ChatbotFloatingButton;
