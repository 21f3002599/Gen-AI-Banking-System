"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const OtpVerificationForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [timer, setTimer] = useState(45);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
            } else {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pastedData.every((char) => !isNaN(Number(char)))) {
            const newOtp = [...otp];
            pastedData.forEach((value, i) => {
                if (i < 6) newOtp[i] = value;
            });
            setOtp(newOtp);
            const nextEmptyIndex = newOtp.findIndex((val) => val === "");
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            setError("Please enter the complete 6-digit code.");
            setIsLoading(false);
            return;
        }

        try {
            console.log("Verifying OTP:", enteredOtp);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const mode = searchParams.get("mode");

            if (mode === "register") {
                router.push("/dashboard/chatbot?onboarding=true");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Invalid verification code.");
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setTimer(45);
        setOtp(new Array(6).fill(""));
        setError(null);
        inputRefs.current[0]?.focus();
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 lg:px-12">
            <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-lg">
                <h2 className="text-3xl font-bold text-[#24b281] mb-2">
                    Email Verification
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                    A 6-digit code has been sent to your email{" "}
                    <span className="font-medium text-gray-700">user***@gmail.com</span>{" "}
                    <Link href="/login" className="text-[#24b281] hover:underline">
                        Change
                    </Link>
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className="w-12 h-12 sm:w-14 sm:h-14 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:border-[#24b281] focus:ring-2 focus:ring-[#24b281]/20 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <p
                            className={`text-sm ${timer > 0 ? "text-[#24b281]" : "text-red-500"}`}
                        >
                            0:{timer.toString().padStart(2, "0")} remaining
                        </p>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button
                        type="submit"
                        className="h-12 rounded-xl bg-[#24b281] hover:bg-[#1ea06f] text-white text-lg cursor-pointer w-full flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Didn't receive the code?{" "}
                    <button
                        onClick={handleResend}
                        disabled={timer > 0}
                        className={`font-semibold ${timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#24b281] hover:underline"}`}
                    >
                        Resend
                    </button>
                </p>
            </div>
        </div>
    );
};

export default OtpVerificationForm;
