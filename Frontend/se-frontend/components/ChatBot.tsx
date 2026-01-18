"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { chatWithBot } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: number;
}

export default function ChatBot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // Hardcoded user_id for testing as per user request
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages
    useEffect(() => {
        const storedMessages = localStorage.getItem("chatbot_messages");
        if (storedMessages) {
            try {
                setMessages(JSON.parse(storedMessages));
            } catch (e) {
                console.error("Failed to parse messages", e);
            }
        }
    }, []);

    // Persist messages
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("chatbot_messages", JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            text: inputValue,
            sender: "user",
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const userId = user?.userId || "anonymous";
            const response = await chatWithBot(inputValue, userId);

            const botMessage: Message = {
                id: crypto.randomUUID(),
                text: response.response || "Sorry, I couldn't understand that.",
                sender: "bot",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                text: "Sorry, I am having trouble connecting to the server.",
                sender: "bot",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            <h3 className="font-semibold">Banking Assistant</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm mt-8">
                                <p>👋 Hi there! How can I help you with your banking today?</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full",
                                    msg.sender === "user" ? "justify-end" : "justify-start",
                                )}
                            >
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        msg.sender === "user"
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-bl-none",
                                    )}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputValue.trim()}
                                size="icon"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-6 h-6" />
                )}
            </Button>
        </div>
    );
}
