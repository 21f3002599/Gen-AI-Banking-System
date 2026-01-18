import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

const SocialLinks = () => {
    return (
        <div className="flex gap-4 mt-10">
            <Link href="#" className="text-[#24b281] hover:opacity-80">
                <Facebook size={28} />
            </Link>
            <Link href="#" className="text-[#24b281] hover:opacity-80">
                <Instagram size={28} />
            </Link>
            <Link href="#" className="text-[#24b281] hover:opacity-80">
                <Twitter size={28} />
            </Link>
        </div>
    );
};

export default SocialLinks;
