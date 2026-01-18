import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ProfileInfoRow from "./ProfileInfoRow";

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    gender: string;
    dob: string;
    address: string;
    avatarUrl: string;
    isPro: boolean;
}

interface ProfileCardProps {
    user: UserProfile;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 flex flex-col items-center w-full max-w-lg mx-auto">
            {/* 1. Avatar Section */}
            <div className="relative mb-6">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        width={128}
                        height={128}
                        className="object-cover h-full w-full"
                    />
                </div>
                {/* Edit Icon Overlay */}
                <button className="absolute bottom-1 right-1 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors shadow-sm border border-white">
                    <Pencil size={16} className="text-gray-600" />
                </button>
            </div>

            {/* 2. Identity Section */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {user.name}
            </h2>

            {/* 3. Details Section */}
            <div className="w-full flex flex-col gap-2 mb-10">
                <ProfileInfoRow label="Email" value={user.email} />
                <ProfileInfoRow label="Phone Number" value={user.phone} />
                <ProfileInfoRow label="Date of Birth" value={user.dob} />
                <ProfileInfoRow label="Gender" value={user.gender} />
                <ProfileInfoRow label="Address" value={user.address} />
            </div>

            {/* 4. Action Section */}
            <Button className="w-full bg-[#24b281] hover:bg-[#1ea06f] text-white h-12 text-lg rounded-xl">
                Reset Password
            </Button>
        </div>
    );
};

export default ProfileCard;
