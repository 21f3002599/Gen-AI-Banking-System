import React from "react";
import AuthBrandSlogan from "@/components/AuthBrandSlogan";
import OtpVerificationForm from "@/components/OtpVerificationForm";

export default async function OtpVerificationPage(props: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const searchParams = await props.searchParams;
  const mode = searchParams.mode;

  const description =
    mode === "register"
      ? "We've sent a verification code to your email. Please enter the code to complete your registration."
      : "We've sent a verification code to your email. Please enter the code to complete your secure login process.";

  return (
    <main className="min-h-screen w-full bg-[#D4F3E7] bg-[url('/images/register-bg.png')] bg-cover bg-center flex items-center justify-center px-4 py-10">
      <div className="grid lg:grid-cols-2 w-full max-w-7xl">
        {/* Left Side: Brand Slogan */}
        <AuthBrandSlogan
          brandName="Vault42"
          heading={
            <>
              Secure your <br /> Account
            </>
          }
          description={description}
        />

        {/* Right Side: OTP Form */}
        <OtpVerificationForm />
      </div>
    </main>
  );
}
