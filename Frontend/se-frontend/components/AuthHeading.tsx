import React from "react";

// 1. Define the props interface
interface AuthHeadingProps {
    brandName: string;
    heading: React.ReactNode; // Use React.ReactNode to allow <br /> tags
    description: string;
}

// 2. Accept and destructure the props
const AuthHeading = ({ brandName, heading, description }: AuthHeadingProps) => {
    return (
        <div className="mt-20">
            {/* 3. Use the props instead of hardcoded text */}
            <p className="text-[#24b281] font-semibold text-lg">{brandName}</p>
            <h1 className="text-6xl font-bold leading-tight mt-4">{heading}</h1>
            <p className="text-gray-600 text-lg mt-6 max-w-xl">{description}</p>
        </div>
    );
};

export default AuthHeading;
