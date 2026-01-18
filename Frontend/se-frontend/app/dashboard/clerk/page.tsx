"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    CheckCircle,
    X,
    Download,
    DollarSign,

    UserPlus,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    getPendingApplications,
    approveApplication,
    rejectApplication,
    getPendingDeposits,
    approveDeposit,
    rejectDeposit,
    getGeneratedReports,
    downloadReport
} from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";

export default function ClerkDashboard() {
    const [activeTab, setActiveTab] = useState("applications");

    // Data States
    const [applications, setApplications] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);

    // Loading States
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "applications") {
                const data = await getPendingApplications();
                setApplications(data);
            } else if (activeTab === "deposits") {
                const data = await getPendingDeposits();
                setDeposits(data);
            } else if (activeTab === "reports") {
                const data = await getGeneratedReports();
                setReports(data);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveApp = async (appNo: string) => {
        if (!confirm(`Approve application ${appNo}?`)) return;
        setActionLoading(appNo);
        try {
            await approveApplication(appNo);
            setApplications(prev => prev.filter(app => app.application_no !== appNo));
        } catch (error) {
            alert("Failed to approve application");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectApp = async (appNo: string) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        setActionLoading(appNo);
        try {
            await rejectApplication(appNo, reason);
            setApplications(prev => prev.filter(app => app.application_no !== appNo));
        } catch (error) {
            alert("Failed to reject application");
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveDeposit = async (txnId: string) => {
        if (!confirm(`Approve deposit ${txnId}?`)) return;
        setActionLoading(txnId);
        try {
            await approveDeposit(txnId);
            setDeposits(prev => prev.filter(txn => txn.transaction_id !== txnId));
        } catch (error) {
            alert("Failed to approve deposit");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectDeposit = async (txnId: string) => {
        if (!confirm(`Reject deposit ${txnId}?`)) return;
        setActionLoading(txnId);
        try {
            await rejectDeposit(txnId);
            setDeposits(prev => prev.filter(txn => txn.transaction_id !== txnId));
        } catch (error) {
            alert("Failed to reject deposit");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownloadReport = async (report: any) => {
        setActionLoading(report.report_id);
        try {
            const blob = await downloadReport(report.report_id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.title}.pdf`; // Use title as filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download report");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen space-y-8">
            {/* Tabs */}
            <div className="border-b border-gray-100 flex gap-4">
                <TabButton active={activeTab === "applications"} onClick={() => setActiveTab("applications")}>
                    <div className="flex items-center gap-2">
                        <UserPlus size={18} />
                        <span>Pending Applications</span>
                        {applications.length > 0 && (
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                {applications.length}
                            </span>
                        )}
                    </div>
                </TabButton>
                <TabButton active={activeTab === "deposits"} onClick={() => setActiveTab("deposits")}>
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} />
                        <span>Pending Deposits</span>
                        {deposits.length > 0 && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                                {deposits.length}
                            </span>
                        )}
                    </div>
                </TabButton>
                <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>
                    <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span>Analyst Reports</span>
                    </div>
                </TabButton>
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
                {loading ? (
                    <LoadingState />
                ) : (
                    <>
                        {/* Applications Tab */}
                        {activeTab === "applications" && (
                            <div className="space-y-4">
                                {applications.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-gray-300" />
                                        <p>No pending applications.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-sm text-gray-500 border-b border-gray-100">
                                                <tr>
                                                    <th className="pb-4 pl-4 font-medium">App No</th>
                                                    <th className="pb-4 font-medium">Name</th>
                                                    <th className="pb-4 font-medium">Applied Date</th>
                                                    <th className="pb-4 font-medium text-right pr-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {applications.map((app) => (
                                                    <tr key={app.application_no} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 pl-4 font-mono text-gray-600">{app.application_no}</td>
                                                        <td className="py-4 font-bold text-gray-900">{app.firstname} {app.lastname}</td>
                                                        <td className="py-4 text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                                                        <td className="py-4 text-right pr-4 flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 border-gray-200 text-gray-600 hover:bg-gray-50"
                                                                onClick={() => setSelectedApp(app)}
                                                            >
                                                                <Eye size={14} className="mr-2" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => handleRejectApp(app.application_no)}
                                                                disabled={actionLoading === app.application_no}
                                                            >
                                                                {actionLoading === app.application_no ? "..." : "Reject"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-gray-900 text-white hover:bg-black"
                                                                onClick={() => handleApproveApp(app.application_no)}
                                                                disabled={actionLoading === app.application_no}
                                                            >
                                                                {actionLoading === app.application_no ? "..." : "Approve"}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Deposits Tab */}
                        {activeTab === "deposits" && (
                            <div className="space-y-4">
                                {deposits.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-gray-300" />
                                        <p>No pending deposits.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="text-sm text-gray-500 border-b border-gray-100">
                                                <tr>
                                                    <th className="pb-4 pl-4 font-medium">Txn ID</th>
                                                    <th className="pb-4 font-medium">Account No</th>
                                                    <th className="pb-4 font-medium">Amount</th>
                                                    <th className="pb-4 font-medium">Date</th>
                                                    <th className="pb-4 font-medium text-right pr-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {deposits.map((txn) => (
                                                    <tr key={txn.transaction_id} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 pl-4 font-mono text-gray-600">{txn.transaction_id}</td>
                                                        <td className="py-4 font-mono text-blue-600 font-medium">{txn.credit_account_no}</td>
                                                        <td className="py-4 font-black text-green-600 text-lg">₹{txn.amount.toLocaleString()}</td>
                                                        <td className="py-4 text-gray-500">{new Date(txn.date).toLocaleDateString()}</td>
                                                        <td className="py-4 text-right pr-4 flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => handleRejectDeposit(txn.transaction_id)}
                                                                disabled={actionLoading === txn.transaction_id}
                                                            >
                                                                {actionLoading === txn.transaction_id ? "..." : "Reject"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-gray-900 text-white hover:bg-black"
                                                                onClick={() => handleApproveDeposit(txn.transaction_id)}
                                                                disabled={actionLoading === txn.transaction_id}
                                                            >
                                                                {actionLoading === txn.transaction_id ? "..." : "Approve"}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reports Tab */}
                        {activeTab === "reports" && (
                            <div className="space-y-4">
                                {reports.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <FileText size={48} className="mx-auto mb-4 opacity-20 text-gray-300" />
                                        <p>No generated reports found.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {reports.map((report) => (
                                            <div key={report.report_id} className="p-6 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow group bg-gray-50 hover:bg-white">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-gray-100 group-hover:bg-blue-50 transition-colors">
                                                            <FileText size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{report.title}</h3>
                                                            <p className="text-xs text-gray-400 font-mono mt-1">{new Date(report.generated_at).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full border-gray-200 text-gray-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                                                    onClick={() => handleDownloadReport(report)}
                                                    disabled={actionLoading === report.report_id}
                                                >
                                                    {actionLoading === report.report_id ? (
                                                        "Downloading..."
                                                    ) : (
                                                        <>
                                                            <Download size={14} className="mr-2" />
                                                            Download PDF
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Application Details Modal */}
            {selectedApp && (
                <ApplicationDetailsModal
                    app={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onApprove={() => handleApproveApp(selectedApp.application_no)}
                    onReject={() => handleRejectApp(selectedApp.application_no)}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
}

function TabButton({ children, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`pb-3 px-4 text-sm font-bold transition-all ${active
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
                }`}
        >
            {children}
        </button>
    );
}

function ApplicationDetailsModal({ app, onClose, onApprove, onReject, actionLoading }: any) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                        <p className="text-sm text-gray-500 font-mono">{app.application_no}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Personal Information */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-50">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoField label="Full Name" value={`${app.firstname} ${app.lastname}`} />
                            <InfoField label="Father's Name" value={app.father_name} />
                            <InfoField label="DOB" value={app.dob} />
                            <InfoField label="Gender" value={app.gender} />
                            <InfoField label="Email" value={app.email} />
                            <InfoField label="Mobile" value={app.mobile_no} />
                        </div>
                    </section>

                    {/* Address Information */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-50">Address Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InfoField label="Address" value={app.address_line} className="md:col-span-2" />
                            <InfoField label="City" value={app.city} />
                            <InfoField label="District" value={app.district} />
                            <InfoField label="State" value={app.state} />
                            <InfoField label="Pincode" value={app.pincode} />
                            <InfoField label="Country" value={app.country} />
                        </div>
                    </section>

                    {/* KYC Documents */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-50">KYC Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField label="Adhar Number" value={app.adhar_card_no} />
                            <InfoField label="PAN Number" value={app.pan_card_no} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                            <DocumentPreview label="Adhar Card (Front)" src={app.adhar_card_image_url} />
                            <DocumentPreview label="Adhar Card (Back)" src={app.adhar_card_back_image_url} />
                            <DocumentPreview label="PAN Card" src={app.pan_card_image_url} />
                            <DocumentPreview label="Live Photo" src={app.customer_image_url} />
                        </div>
                    </section>
                </div>

                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-6 flex justify-end gap-3 rounded-b-3xl">
                    <Button variant="outline" onClick={onClose} className="h-12 px-6">
                        Close
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onReject}
                        disabled={actionLoading === app.application_no}
                        className="h-12 px-6 bg-red-600 hover:bg-red-700 hover:text-white"
                    >
                        Reject Application
                    </Button>
                    <Button
                        onClick={onApprove}
                        disabled={actionLoading === app.application_no}
                        className="h-12 px-6 bg-[#24b281] hover:bg-[#1ea06f] text-white"
                    >
                        Approve Application
                    </Button>
                </div>
            </div>
        </div>
    );
}

function InfoField({ label, value, className = "" }: any) {
    return (
        <div className={className}>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
            <p className="text-gray-900 font-medium break-words">{value || "N/A"}</p>
        </div>
    );
}

function DocumentPreview({ label, src }: any) {
    if (!src) return null;
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <div className="p-3 border-b border-gray-200 bg-white">
                <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
            </div>
            <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={label}
                    className="object-contain w-full h-full hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                    onClick={() => window.open(src, '_blank')}
                />
            </div>
        </div>
    );
}
