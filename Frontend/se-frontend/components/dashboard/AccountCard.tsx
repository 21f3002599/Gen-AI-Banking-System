import React from "react";

interface AccountCardProps {
    label: string;
    balance: number;
    subtext?: string;
    color?: string; // Optional prop if we want different colored cards later
}

const AccountCard = ({ label, balance, subtext }: AccountCardProps) => {
    return (
        <div className="bg-[#E0F5EC] rounded-3xl p-6 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col gap-1">
                <span className="text-[#24b281] font-medium text-sm">{label}</span>
                {subtext && <span className="text-gray-500 text-xs font-mono">{subtext}</span>}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
                ₹ {balance.toLocaleString()}
            </h3>
        </div>
    );
};

export default AccountCard;
