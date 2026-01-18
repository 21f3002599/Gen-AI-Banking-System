"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    Icon: LucideIcon;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthInput = ({
    id,
    label,
    type,
    placeholder,
    Icon,
    value,
    onChange,
}: AuthInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    // Determine the current type to use (text or password)
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="grid w-full gap-2">
            <Label htmlFor={id} className="font-medium">
                {label}
            </Label>
            <div className="relative">
                <Icon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                />
                <Input
                    id={id}
                    type={currentType}
                    placeholder={placeholder}
                    className="pl-12 h-12 rounded-xl border-gray-300"
                    value={value}
                    onChange={onChange}
                />
                {/* Add the toggle button if it's a password field */}
                {isPassword && (
                    <button
                        type="button" // Important: prevents form submission
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AuthInput;
