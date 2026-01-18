import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface ChatMessageProps {
    message: string;
    isAi: boolean;
    timestamp: string;
}

const ChatMessage = ({ message, isAi, timestamp }: ChatMessageProps) => {
    return (
        <div
            className={cn(
                "flex w-full gap-4 max-w-3xl animate-in fade-in slide-in-from-bottom-2",
                isAi ? "flex-row" : "flex-row-reverse self-end",
            )}
        >
            <div
                className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border border-gray-100 shadow-sm",
                    isAi ? "bg-[#E0F5EC]" : "bg-gray-100",
                )}
            >
                {isAi ? (
                    <Bot className="text-[#24b281]" size={20} />
                ) : (
                    <Image
                        src="/images/dp-1.png"
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full object-cover h-full w-full"
                    />
                )}
            </div>

            <div
                className={cn(
                    "flex flex-col gap-1",
                    isAi ? "items-start" : "items-end",
                )}
            >
                <div
                    className={cn(
                        "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm max-w-md",
                        isAi
                            ? "bg-white text-gray-700 rounded-tl-none"
                            : "bg-[#24b281] text-white rounded-tr-none",
                    )}
                >
                    {message}
                </div>
                <span className="text-xs text-gray-400 px-1">{timestamp}</span>
            </div>
        </div>
    );
};

export default ChatMessage;
