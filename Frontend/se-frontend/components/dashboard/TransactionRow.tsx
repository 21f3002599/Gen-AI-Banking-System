import React from "react";

interface TransactionRowProps {
    name: string;
    date: string;
    amount: number;
    type: "credit" | "debit";
}

const TransactionRow = ({ name, date, amount, type }: TransactionRowProps) => {
    const isCredit = type === "credit";

    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-none hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
            <div className="flex flex-col">
                <span className="font-medium text-gray-700">{name}</span>
                <span className="text-xs text-gray-400">{date}</span>
            </div>
            <span
                className={`font-bold ${isCredit ? "text-[#24b281]" : "text-red-500"}`}
            >
                {isCredit ? "+" : "-"} ₹ {amount.toLocaleString()}
            </span>
        </div>
    );
};

export default TransactionRow;
