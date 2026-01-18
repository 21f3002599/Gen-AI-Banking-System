import React from "react";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
    return (
        <Link href="/" className="flex items-center gap-3">
            <Image
                src="/images/logo_4.png"
                alt="Vault42 Logo"
                width={48}
                height={48}
                className="rounded-md"
            />
            <span className="text-2xl font-semibold">Vault42</span>
        </Link>
    );
};

export default Logo;
