"use client";

import React, { useRef } from "react";
import {
    Camera,
    FileText,
    CheckCircle2,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCUploadBubbleProps {
    label: string;
    onUpload: (file: File) => void;
    isCompleted?: boolean;
    isUploading?: boolean;
}

const KYCUploadBubble = ({
    label,
    onUpload,
    isCompleted = false,
    isUploading = false,
}: KYCUploadBubbleProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (!isCompleted && !isUploading) {
            // Reset value to allow selecting the same file again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
                fileInputRef.current.click();
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-sm w-full">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className={cn(
                            "p-2 rounded-lg",
                            isCompleted
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-50 text-blue-600",
                        )}
                    >
                        <FileText size={20} />
                    </div>
                    <span className="font-medium text-gray-900">{label}</span>
                    {isCompleted && (
                        <CheckCircle2 size={20} className="text-green-500 ml-auto" />
                    )}
                    {isUploading && (
                        <Loader2 size={20} className="text-blue-500 ml-auto animate-spin" />
                    )}
                </div>

                {!isCompleted ? (
                    <div
                        onClick={handleClick}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all group",
                            isUploading
                                ? "border-gray-200 bg-gray-50 cursor-wait"
                                : "border-gray-300 cursor-pointer hover:border-[#24b281] hover:bg-gray-50",
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />

                        {isUploading ? (
                            <div className="flex flex-col items-center text-gray-400">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                <span className="text-sm">Uploading & Scanning...</span>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gray-100 p-3 rounded-full mb-2 group-hover:bg-[#E0F5EC]">
                                    <Camera
                                        className="text-gray-500 group-hover:text-[#24b281]"
                                        size={24}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    Click to Scan or Upload
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    Supports JPG, PNG, PDF
                                </span>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between text-green-700 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            <span>Upload complete</span>
                        </div>
                        {/* Optional: Allow re-upload even if completed if needed */}
                        {/* <button className="p-1 hover:bg-green-100 rounded-full" onClick={() => fileInputRef.current?.click()}>
                            <RefreshCw size={14} /> 
                        </button> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KYCUploadBubble;
