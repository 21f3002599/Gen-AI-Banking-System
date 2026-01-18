import React from "react";
import { Eye, EyeOff, MoveDown, MoveUp } from "lucide-react";
import Image from "next/image";

interface BalanceOverviewCardProps {
    currentBalance: number;
    income: number;
    expense: number;
}

const BalanceOverviewCard = ({
    currentBalance,
    income,
    expense,
}: BalanceOverviewCardProps) => {
    return (
        <div className="bg-[#E0F5EC] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            {/* Left: Brand Icon/Logo area */}
            <div className="hidden md:flex items-center justify-center h-24 w-24 bg-white/50 rounded-2xl border border-[#24b281]/20">
                <Image
                    src="/images/logo_4.png"
                    alt="Vault42"
                    width={50}
                    height={50}
                    className="opacity-80"
                />
            </div>

            {/* Middle: Current Balance */}
            <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
                <span className="text-[#24b281] font-medium text-sm">
                    Current Balance
                </span>
                <h2 className="text-4xl font-bold text-gray-900">
                    ₹ {currentBalance.toLocaleString()}
                </h2>
            </div>

            {/* Right: Income & Expense */}
            <div className="flex gap-8">
                {/* Income */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[#24b281] mb-1">
                        <span className="text-sm font-medium">Income</span>
                        <MoveDown size={14} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        ₹ {income.toLocaleString()}
                    </span>
                </div>

                {/* Expense */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-red-500 mb-1">
                        <span className="text-sm font-medium">Expense</span>
                        <MoveUp size={14} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                        ₹ {expense.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BalanceOverviewCard;
