"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Phone, Loader2 } from "lucide-react";
import AuthInput from "@/components/AuthInput";
import { useAuth } from "@/app/context/AuthContext";

const RegisterForm = () => {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // 1. Client-side Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        if (
            !process.env.NEXT_PUBLIC_API_BASE_URL ||
            !process.env.NEXT_PUBLIC_CUSTOMER_ROLE_ID
        ) {
            setError("System configuration error: Missing API details.");
            setIsLoading(false);
            return;
        }

        try {
            // 2. Prepare Data for API
            // The API expects: email, password, mobile_no, role_id
            const payload = {
                email: email,
                password: password,
                mobile_no: mobileNo,
                role_id: process.env.NEXT_PUBLIC_CUSTOMER_ROLE_ID,
            };

            // 3. Make the API Call
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );

            // 4. Handle Response
            if (!response.ok) {
                // Try to get error message from server response
                const errorData = await response.json().catch(() => null);
                const errorMessage =
                    errorData?.detail ||
                    errorData?.message ||
                    "Registration failed. Please try again.";
                throw new Error(errorMessage);
            }

            // Success: API returned 201 Created
            // Optionally, you can handle the response data here (e.g. user_id)
            // const data = await response.json();

            // Redirect to OTP page with mode=register
            router.push("/otp-verification?mode=register");
        } catch (err: any) {
            console.error("Registration Error:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 lg:px-12">
            <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-lg">
                <h2 className="text-3xl font-bold text-[#24b281] mb-8">Register</h2>

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
                        id="mobile"
                        label="Mobile Number"
                        type="tel"
                        placeholder="Enter your Mobile Number"
                        Icon={Phone}
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
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

                    <AuthInput
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your Password"
                        Icon={Lock}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className="flex items-start gap-3 mt-2">
                        <Checkbox id="terms" required />
                        <Label
                            htmlFor="terms"
                            className="text-sm text-gray-500 leading-relaxed"
                        >
                            I agree to all the{" "}
                            <Link href="/terms" className="text-[#24b281] hover:underline">
                                Terms
                            </Link>
                            ,{" "}
                            <Link href="/privacy" className="text-[#24b281] hover:underline">
                                Privacy Policy
                            </Link>{" "}
                            and{" "}
                            <Link href="/fees" className="text-[#24b281] hover:underline">
                                Fees
                            </Link>
                            .
                        </Label>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="h-12 rounded-xl bg-[#24b281] hover:bg-[#1ea06f] text-white text-lg cursor-pointer flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Register"
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-[#24b281] font-semibold hover:underline"
                    >
                        Log in.
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
