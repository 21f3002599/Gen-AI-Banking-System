"use client";

import React, { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSend(inputValue);
            setInputValue("");
        }
    };

    return (
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mt-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-[#24b281] transition-colors"
                >
                    <Paperclip size={20} />
                </button>

                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask Vault42 AI anything..."
                    className="border-none shadow-none bg-gray-50 rounded-xl h-12 focus-visible:ring-1 focus-visible:ring-[#24b281]/30"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-[#24b281] hover:bg-[#1ea06f] shrink-0"
                    disabled={isLoading || !inputValue.trim()}
                >
                    <Send size={20} className="text-white ml-0.5" />
                </Button>
            </form>
        </div>
    );
};

export default ChatInput;
