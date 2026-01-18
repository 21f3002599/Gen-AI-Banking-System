"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChatbotFloatingButton from "@/components/dashboard/chatbot/ChatbotFlyingButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCareDashboard = pathname?.startsWith("/dashboard/care");
  const isAnalystDashboard = pathname?.startsWith("/dashboard/analyst");
  const isClerkDashboard = pathname?.startsWith("/dashboard/clerk");


  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* Sidebar (Fixed on Desktop) */}
      <Sidebar />

      {/* Main Content Area */}
      {/* ml-64 pushes content to right to account for fixed sidebar width */}
      <div className="md:ml-64 min-h-screen">
        <div className="container mx-auto px-6 lg:px-10">
          <DashboardHeader />
          <main className="pb-10">{children}</main>
        </div>
      </div>
      {/* Floating AI Assistant Button - Hidden on Care and Analyst Dashboards */}
      {!isCareDashboard && !isAnalystDashboard && !isClerkDashboard && <ChatbotFloatingButton />}
    </div>
  );
}
