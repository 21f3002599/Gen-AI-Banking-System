import React from "react";
import Logo from "@/components/Logo";
import AuthHeading from "@/components/AuthHeading";
import SocialLinks from "@/components/SocialLinks";

// 1. Define an interface for this component's props
interface AuthBrandSloganProps {
    brandName: string;
    heading: React.ReactNode;
    description: string;
}

// 2. Accept the props
const AuthBrandSlogan = ({
    brandName,
    heading,
    description,
}: AuthBrandSloganProps) => {
    return (
        <div className="hidden lg:flex flex-col justify-between px-16 py-12">
            <Logo />
            {/* 3. Pass the props down to AuthHeading */}
            <AuthHeading
                brandName={brandName}
                heading={heading}
                description={description}
            />
            <SocialLinks />
        </div>
    );
};

export default AuthBrandSlogan;
