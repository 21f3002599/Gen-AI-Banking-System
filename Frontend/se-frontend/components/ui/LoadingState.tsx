import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState() {
    return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
            <Loader2 className="w-10 h-10 animate-spin text-[#24b281]" />
        </div>
    );
}
