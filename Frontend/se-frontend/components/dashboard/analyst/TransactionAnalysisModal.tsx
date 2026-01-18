"use client";

import React, { useEffect, useState } from "react";
import { X, ArrowRight, ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAnalystAccountDetails, blockAccount } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";

interface TransactionAnalysisModalProps {
    alert: any;
    onClose: () => void;
    onBlockSuccess: () => void;
}

export default function TransactionAnalysisModal({ alert, onClose, onBlockSuccess }: TransactionAnalysisModalProps) {
    const [sender, setSender] = useState<any>(null);
    const [receiver, setReceiver] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [blocking, setBlocking] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mocking Debit/Credit Account Numbers if missing in alert
                // In a real scenario, alert should have source/dest
                const debitAcc = alert.account_no; // Assuming alert is for the sender essentially
                const creditAcc = "00000015"; // Mock receiver or fetch from alert if available

                const [senderData, receiverData] = await Promise.all([
                    getAnalystAccountDetails(debitAcc).catch(() => ({
                        customer_name: "Unknown",
                        account_no: debitAcc,
                        balance: 0,
                        status: "unknown"
                    })),
                    getAnalystAccountDetails(creditAcc).catch(() => ({
                        customer_name: "Crypto Exchange",
                        account_no: creditAcc,
                        balance: 0,
                        status: "active"
                    }))
                ]);

                setSender(senderData);
                setReceiver(receiverData);
            } catch (error) {
                console.error("Failed to load details", error);
            } finally {
                setLoading(false);
            }
        };

        if (alert) fetchData();
    }, [alert]);

    const handleBlock = async (accountNo: string) => {
        if (!confirm(`Block account ${accountNo}?`)) return;
        setBlocking(accountNo);
        try {
            await blockAccount(accountNo, `Suspicious transaction linked to alert ${alert.id}`);
            onBlockSuccess();
            // Optimistic update or just alert
            window.alert(`Account ${accountNo} blocked successfully.`);
            onClose();
        } catch (error) {
            console.error("Block failed", error);
            window.alert("Failed to block account.");
        } finally {
            setBlocking(null);
        }
    };

    if (!alert) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#0f172a] text-white rounded-t-3xl">
                    <div>
                        <h2 className="text-xl font-bold">Transaction Analysis</h2>
                        <p className="text-xs text-gray-400 font-mono mt-1">ID: {alert.alert_id || "TXN-Unknown"}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12"><LoadingState /></div>
                ) : (
                    <div className="p-6 md:p-8 flex flex-col gap-8">
                        {/* Top Section: Alert & Amount */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Alert Trigger Card */}
                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col justify-between">
                                <div>
                                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Alert Trigger</div>
                                    <h3 className="text-xl font-bold text-red-900 mb-4">{alert.alert_type}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-red-700 bg-red-100/50 px-3 py-2 rounded-lg w-fit">
                                    <ShieldAlert size={16} />
                                    <span className="text-sm font-medium">Risk Score: {(alert.risk_score * 100).toFixed(0)}%</span>
                                </div>
                            </div>

                            {/* Amount Card */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Transaction Amount</span>
                                <span className="text-5xl font-black text-gray-900">₹{alert.amount?.toLocaleString() || "25,000"}</span>
                                <span className="text-xs text-gray-400 font-mono mt-2">online | crypto</span>
                            </div>
                        </div>

                        {/* Accounts Comparison */}
                        <div className="flex flex-col md:flex-row gap-6 items-stretch relative">
                            {/* Arrow Indicator (Desktop) */}
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full border border-gray-200 shadow-sm text-gray-400">
                                <ArrowRight size={20} />
                            </div>

                            {/* Sender (Debit) */}
                            <div className="flex-1 bg-white p-0 rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Debit Account (Sender)</div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{sender.customer_name}</h4>
                                    <p className="font-mono text-gray-500 text-sm mb-6">{sender.account_no}</p>

                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                        <span className="text-sm text-gray-500">Balance</span>
                                        <span className="font-bold text-gray-900">₹{sender.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${sender.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{sender.status}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <Button
                                        onClick={() => handleBlock(sender.account_no)}
                                        disabled={sender.status === 'blocked' || blocking !== null}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {sender.status === 'blocked' ? 'Account Blocked' : 'Block Account'}
                                    </Button>
                                </div>
                            </div>

                            {/* Receiver (Credit) */}
                            <div className="flex-1 bg-white p-0 rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Credit Account (Receiver)</div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{receiver.customer_name}</h4>
                                    <p className="font-mono text-gray-500 text-sm mb-6">{receiver.account_no}</p>

                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                        <span className="text-sm text-gray-500">Balance</span>
                                        <span className="font-bold text-gray-900">₹{receiver.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="mt-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${receiver.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{receiver.status}</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <Button
                                        onClick={() => handleBlock(receiver.account_no)}
                                        disabled={receiver.status === 'blocked' || blocking !== null}
                                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    >
                                        {receiver.status === 'blocked' ? 'Account Blocked' : 'Block Account'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
