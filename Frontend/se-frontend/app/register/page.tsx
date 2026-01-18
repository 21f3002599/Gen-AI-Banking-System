import React from "react";
import AuthBrandSlogan from "@/components/AuthBrandSlogan";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-[#D4F3E7] bg-[url('/images/register-bg.png')] bg-cover bg-center flex items-center justify-center px-4 py-10">
      <div className="grid lg:grid-cols-2 w-full max-w-7xl">
        {/* Pass the props for the register page */}
        <AuthBrandSlogan
          brandName="Vault42"
          heading={
            <>
              Experience <br /> hassle-free banking
            </>
          }
          description="Experience simple, secure, and stress-free banking. Say goodbye to long
          queues and complex procedures and hello to hassle-free banking with
          Vault42."
        />
        <RegisterForm />
      </div>
    </main>
  );
}
