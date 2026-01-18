"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { depositCash } from "@/lib/api";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function DepositPage() {
    const { user } = useAuth();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.accountNo || !amount) return;

        setLoading(true);
        setStatus("idle");
        setMessage("");

        try {
            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error("Please enter a valid amount.");
            }

            await depositCash(user.accountNo, numericAmount);
            setStatus("success");
            setMessage("Deposit request submitted successfully! Pending approval.");
            setAmount(""); // Reset form
        } catch (error: any) {
            console.error("Deposit failed", error);
            setStatus("error");
            setMessage(error.message || "Failed to submit deposit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Cash Deposit</h1>

            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <form onSubmit={handleDeposit} className="flex flex-col gap-6">
                    {/* Account Number Field (Read-only) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-600">
                            Account Number
                        </label>
                        <input
                            type="text"
                            value={user?.accountNo || "Loading..."}
                            readOnly
                            className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    {/* Amount Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-600">
                            Amount to Deposit (₹)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount, e.g. 5000"
                            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#24b281]/20 focus:border-[#24b281] transition-all"
                            required
                            min="1"
                        />
                    </div>

                    {/* Status Messages */}
                    {status === "success" && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
                            <CheckCircle size={20} />
                            <span>{message}</span>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{message}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !user?.accountNo}
                        className="mt-4 w-full bg-[#24b281] hover:bg-[#1ea070] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : (
                            "Deposit Cash"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
