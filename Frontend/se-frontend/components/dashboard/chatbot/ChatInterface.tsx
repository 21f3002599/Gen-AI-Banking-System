"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import KYCUploadBubble from "./KYCUploadBubble";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { chatWithBot } from "@/lib/api";

// Frontend Message Structure
interface Message {
    id: string;
    text: string;
    isAi: boolean;
    timestamp: string;
    type?:
    | "text"
    | "kyc-upload"
    | "extraction-success"
    | "error"
    | "action-required";
    kycLabel?: string; // Used for UI bubble label (e.g., "Adhar Card")
    uploadAction?: string; // Used for API upload type (e.g., "adhar", "pan")
    isCompleted?: boolean;
    extractedData?: Record<string, string>;
    videoUrl?: string; // URL for embedded video
}

// Backend Message Structure (matching Pydantic model)
interface BackendMessage {
    id: string;
    type: string;
    text: string;
    timestamp: string;
    payload?: {
        extractedData?: Record<string, any>;
        action?: string;
        video_url?: string;
    };
}

const ChatInterface = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const isOnboarding = searchParams.get("onboarding") === "true";
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState(false);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initial greeting / restore session
    // Initial greeting (Local only, no API call)
    useEffect(() => {
        if (!user || initialized) return;

        if (messages.length === 0) {
            setMessages([
                {
                    id: "init-welcome",
                    text: "Hello! I am your banking assistant. How can I help you today?",
                    isAi: true,
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    type: "text",
                },
            ]);
        }
        setInitialized(true);
    }, [user, initialized]);

    const mapBackendToFrontend = (backendMsg: BackendMessage): Message => {
        let type: Message["type"] = "text";
        let kycLabel = undefined;
        let uploadAction = undefined;
        let extractedData = undefined;
        let videoUrl = undefined;

        if (backendMsg.type === "action-required") {
            type = "kyc-upload";
            const action = backendMsg.payload?.action;
            uploadAction = action; // Store raw action for API mapping
            videoUrl = backendMsg.payload?.video_url;

            // Map backend action to UI Label
            if (action === "upload_adhar") kycLabel = "Adhar Card";
            else if (action === "upload_pan") kycLabel = "PAN Card";
            else if (action === "upload_live_photo") kycLabel = "Live Photo";
            else kycLabel = "Document";
        } else if (backendMsg.type === "extraction-success") {
            type = "extraction-success";
            extractedData = backendMsg.payload?.extractedData;
        }

        return {
            id: backendMsg.id,
            text: backendMsg.text,
            isAi: true,
            timestamp: new Date(backendMsg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            type,
            kycLabel,
            uploadAction, // We need this later for the upload API
            extractedData,
            videoUrl,
        };
    };

    const handleSendMessage = async (text: string, isHiddenInit = false) => {
        if (!user) return;

        // Don't show "start" or "hello" if it's the hidden initialization
        if (!isHiddenInit) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: text,
                    isAi: false,
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    type: "text",
                },
            ]);
        }

        setIsLoading(true);

        try {
            const data = await chatWithBot(text, user.userId);
            //console.log(data.messages[0].text);

            if (data.messages && Array.isArray(data.messages)) {
                const newMessages = data.messages.map(mapBackendToFrontend);
                setMessages((prev) => [...prev, ...newMessages]);
            } else {
                // Fallback for unexpected response structure
                console.error("Unexpected response format:", data);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        text: "Received an invalid response from the server.",
                        isAi: true,
                        timestamp: new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        type: "error",
                    },
                ]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: "Sorry, I'm having trouble connecting to the server.",
                    isAi: true,
                    timestamp: "Now",
                    type: "error",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (
        file: File,
        messageId: string,
        actionType?: string,
    ) => {
        if (!user) return;

        // Map the UI action back to the API's expected file_type
        // Backend expects: 'adhar', 'pan', 'live_photo'
        let fileType = "adhar"; // Default
        if (actionType === "upload_pan") fileType = "pan";
        else if (actionType === "upload_live_photo") fileType = "live_photo";
        else if (actionType === "upload_adhar") fileType = "adhar";

        // Mark the upload bubble as completed immediately for better UX
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId ? { ...msg, isCompleted: true } : msg,
            ),
        );

        setIsLoading(true);

        const formData = new FormData();
        formData.append("user_id", user.userId);
        formData.append("file", file);
        formData.append("file_type", fileType);

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                // Headers: Do NOT set Content-Type for FormData, browser does it automatically with boundary
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            const backendMessages: BackendMessage[] = data.messages;
            const newMessages = backendMessages.map(mapBackendToFrontend);
            setMessages((prev) => [...prev, ...newMessages]);
        } catch (error) {
            console.error("Upload Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: "Failed to upload document. Please try again.",
                    isAi: true,
                    timestamp: "Now",
                    type: "error",
                },
            ]);
            // Revert completion if failed?
            // For now, we just show an error message.
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Please log in to use the Assistant.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6 text-sm text-[#24b281] bg-[#E0F5EC] py-2 px-4 rounded-full self-center animate-pulse">
                <Sparkles size={16} />
                <span className="font-medium">Powered by GenAI</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-6 no-scrollbar">
                {messages.map((msg) => (
                    <React.Fragment key={msg.id}>
                        {msg.text && (
                            <ChatMessage
                                message={msg.text}
                                isAi={msg.isAi}
                                timestamp={msg.timestamp}
                            />
                        )}

                        {msg.videoUrl && (
                            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-10 shrink-0"></div>
                                <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                                    <iframe
                                        width="100%"
                                        height="200"
                                        src={msg.videoUrl}
                                        title="Instruction Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {msg.type === "extraction-success" && msg.extractedData && (
                            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-10 shrink-0"></div>
                                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-sm w-full">
                                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">
                                        Extracted Information
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(msg.extractedData).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-gray-600 capitalize">
                                                    {key.replace(/_/g, " ")}:
                                                </span>
                                                <span className="font-medium text-gray-900 truncate max-w-[60%]">
                                                    {String(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {msg.type === "kyc-upload" && (
                            <div className="flex gap-4">
                                <div className="w-10 shrink-0"></div>
                                <KYCUploadBubble
                                    label={msg.kycLabel || "Document"}
                                    isCompleted={msg.isCompleted}
                                    onUpload={(file) =>
                                        handleUpload(file, msg.id, msg.uploadAction)
                                    }
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm px-14">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                onSend={(text) => handleSendMessage(text)}
                isLoading={isLoading}
            />
        </div>
    );
};

export default ChatInterface;
