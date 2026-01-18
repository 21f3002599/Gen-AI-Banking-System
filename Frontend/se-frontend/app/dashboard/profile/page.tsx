"use client";

import React, { useEffect, useState } from "react";
import ProfileCard from "@/components/dashboard/profile/ProfileCard";
import { getCustomerProfile } from "@/lib/api";
import { Loader2 } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCustomerProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  // Fallback if API fails or returns empty fields
  const user = {
    name: profile?.customer_name || "User",
    email: profile?.email || "N/A",
    phone: profile?.mobile_no ? `+${profile.mobile_no}` : "N/A",
    dob: profile?.dob || "N/A",
    gender: profile?.gender || "N/A",
    address: profile?.address || "N/A",
    avatarUrl: "/images/dp-1.png", // Static for now
    isPro: true,
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <ProfileCard user={user} />
    </div>
  );
}
