import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Import icons from lucide-react (installed by shadcn)
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
    const helpLinks = [
        { title: "Help Center", href: "#" },
        { title: "Contact Us", href: "#" },
        { title: "How to Use", href: "#" },
    ];

    const aboutLinks = [
        { title: "About Vault42", href: "#" },
        { title: "Terms & Conditions", href: "#" },
        { title: "Privacy Policy", href: "#" },
    ];

    return (
        <footer id="footer" className="w-full bg-[#D4F3E7] py-16 md:py-24">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                {/* === Left Column: Links, Logo, Copyright === */}
                <div className="flex flex-col gap-8">
                    {/* Link Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-4">HELP</h3>
                            <div className="flex flex-col gap-3">
                                {helpLinks.map((link) => (
                                    <Link
                                        key={link.title}
                                        href={link.href}
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">ABOUT</h3>
                            <div className="flex flex-col gap-3">
                                {aboutLinks.map((link) => (
                                    <Link
                                        key={link.title}
                                        href={link.href}
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/logo_4.png"
                            alt="Vault42"
                            width={30}
                            height={30}
                        />
                        <span className="font-bold text-lg">Vault42</span>
                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-muted-foreground">
                        2024 Vault42. All rights reserved!
                    </p>

                    {/* Social Icons */}
                    <div className="flex gap-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Facebook size={24} />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Instagram size={24} />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary">
                            <Twitter size={24} />
                        </Link>
                    </div>
                </div>

                {/* === Right Column */}
                <div className="relative rounded-2xl overflow-hidden p-8 text-white min-h-[400px] flex flex-col justify-center">
                    <Image
                        src="/images/footer-bg.png"
                        alt="City buildings"
                        layout="fill"
                        objectFit="cover"
                        className="absolute z-0"
                    />

                    {/* Content Overlay */}
                    <div className="relative z-10 flex flex-col gap-4">
                        <p className="font-semibold">New to Vault42?</p>
                        <h2 className="text-3xl font-bold">
                            Enter your Email and Get Started Now
                        </h2>

                        {/* Form */}
                        <div className="flex flex-col md:flex-row gap-2 mt-4">
                            <Input
                                type="email"
                                placeholder="Enter your Email"
                                // Style the input to look good on a dark background
                                className="bg-white/30 border-none placeholder:text-gray-200"
                            />
                            <Button size="lg">Get Started</Button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
