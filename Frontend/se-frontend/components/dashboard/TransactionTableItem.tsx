import React from "react";
import { Plus, Minus } from "lucide-react";

interface TransactionTableItemProps {
    name: string;
    type?: string;
    date: string;
    amount: number;
    status?: "Pending" | "Completed" | "Canceled";
    isCredit: boolean;
}

const TransactionTableItem = ({
    name,
    type = "Bank Transfer", // Default if missing
    date,
    amount,
    status = "Completed", // Default if missing
    isCredit,
}: TransactionTableItemProps) => {
    // Status Badge Styles
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Completed":
                return "bg-[#24b281] text-white";
            case "Pending":
                return "bg-gray-200 text-gray-600";
            case "Canceled":
                return "bg-red-500 text-white";
            default:
                return "bg-gray-100 text-gray-500";
        }
    };

    return (
        <div className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors px-4 rounded-xl">
            {/* Icon */}
            <div className="col-span-1 flex justify-center">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? "bg-[#24b281]" : "bg-[#ff6b6b]"
                        }`}
                >
                    {isCredit ? (
                        <Plus className="text-white" size={20} />
                    ) : (
                        <Minus className="text-white" size={20} />
                    )}
                </div>
            </div>

            {/* Name */}
            <div className="col-span-3 text-gray-700 font-medium truncate">
                {name}
            </div>

            {/* Type */}
            <div className="col-span-2 text-gray-500 text-sm hidden md:block">
                {type}
            </div>

            {/* Date */}
            <div className="col-span-3 text-gray-500 text-sm font-mono">
                {date}
            </div>

            {/* Amount */}
            <div
                className={`col-span-2 font-bold text-right ${isCredit ? "text-[#24b281]" : "text-[#ff6b6b]"
                    }`}
            >
                {isCredit ? "+" : "-"} {amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('₹', '')}
            </div>

            {/* Status */}
            <div className="col-span-1 flex justify-end">
                <span
                    className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${getStatusStyle(
                        status
                    )}`}
                >
                    {status}
                </span>
            </div>
        </div>
    );
};

export default TransactionTableItem;