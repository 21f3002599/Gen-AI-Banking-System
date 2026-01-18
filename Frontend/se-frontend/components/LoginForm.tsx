"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Mail, Lock } from "lucide-react";
import AuthInput from "./AuthInput";
import { useAuth } from "../app/context/AuthContext";
import { loginUser } from "../services/authService";

const LoginForm = () => {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // 1. Call the API Service
            const data = await loginUser({ email, password });

            // 2. Update Global Context
            // This function handles token parsing, storage, and redirect
            login(data.access_token, email);
        } catch (err: any) {
            console.error("Login Error:", err);
            // Display the user-friendly error message thrown by the service
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 lg:px-12">
            <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-lg">
                <h2 className="text-3xl font-bold text-[#24b281] mb-8">Login</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <AuthInput
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter your Email"
                        Icon={Mail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <AuthInput
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Enter your Password"
                        Icon={Lock}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="h-12 rounded-xl bg-[#24b281] hover:bg-[#1ea06f] text-white text-lg cursor-pointer transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="text-[#24b281] font-semibold hover:underline"
                    >
                        Register.
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
