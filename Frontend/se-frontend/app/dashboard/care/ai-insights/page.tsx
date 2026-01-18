"use client";

import React, { useEffect, useState } from "react";
import { getGrievanceAiSummary } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AiInsightsPage() {
    const [summary, setSummary] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getGrievanceAiSummary().catch(() => ({ summary: "No summary available." }));
                setSummary(data.summary);
            } catch (error) {
                console.error("Failed to load AI summary", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) return <LoadingState />;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/care">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">AI Operational Insights</h1>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={120} className="text-purple-600" />
                </div>

                <div className="flex items-center gap-3 mb-6 text-purple-700 relative z-10">
                    <div className="bg-purple-100 p-3 rounded-xl">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Daily Operational Summary</h2>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 relative z-10">
                    <p className="text-gray-800 leading-relaxed font-medium text-lg whitespace-pre-line">
                        {summary}
                    </p>
                </div>
            </div>
        </div>
    );
}
