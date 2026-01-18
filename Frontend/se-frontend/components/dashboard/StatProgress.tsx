import React from "react";
import { Image as LucideImage } from "lucide-react"; // Fallback icon
import Image from "next/image";

interface StatProgressProps {
    label: string;
    amount: number;
    percentage: number; // 0 to 100
    colorClass: string; // e.g. "bg-[#24b281]"
    iconSrc?: string; // Optional icon
}

const StatProgress = ({
    label,
    amount,
    percentage,
    colorClass,
    iconSrc,
}: StatProgressProps) => {
    return (
        <div className="flex items-center gap-6 w-full">
            {/* Icon Box */}
            <div className="h-12 w-12 rounded-xl border border-gray-100 flex items-center justify-center bg-white shrink-0">
                {iconSrc ? (
                    <Image src={iconSrc} alt={label} width={24} height={24} />
                ) : (
                    <LucideImage className="text-gray-400" />
                )}
            </div>

            {/* Label */}
            <span className="w-20 text-gray-500 font-medium text-sm shrink-0">
                {label}
            </span>

            {/* Progress Bar */}
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {/* Amount */}
            <span className="w-24 text-right font-bold text-gray-900 shrink-0">
                ₹ {amount.toLocaleString()}
            </span>
        </div>
    );
};

export default StatProgress;
