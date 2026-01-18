import React from "react";

interface ProfileInfoRowProps {
    label: string;
    value: string;
}

const ProfileInfoRow = ({ label, value }: ProfileInfoRowProps) => {
    return (
        <div className="flex flex-col gap-1 py-4 border-b border-gray-100 last:border-none w-full">
            <span className="text-sm text-[#24b281] font-medium">{label}</span>
            <span className="text-lg font-bold text-gray-900">{value}</span>
        </div>
    );
};

export default ProfileInfoRow;
