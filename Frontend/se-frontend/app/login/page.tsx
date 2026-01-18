import React from "react";
import AuthBrandSlogan from "@/components/AuthBrandSlogan";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  // 2. Rename function
  return (
    <main className="min-h-screen w-full bg-[#D4F3E7] bg-[url('/images/register-bg.png')] bg-cover bg-center flex items-center justify-center px-4 py-10">
      <div className="grid lg:grid-cols-2 w-full max-w-7xl">
        {/* 3. Update props based on the login image */}
        <AuthBrandSlogan
          brandName="Vault42"
          heading={<>Welcome Back</>}
          description="Enter Your Details to login to your Banking Dashboard again!"
        />
        <LoginForm />
      </div>
    </main>
  );
}
