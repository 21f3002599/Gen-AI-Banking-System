import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = () => {
    return (
        <section className="w-full bg-[#D4F3E7] py-16 md:py-24">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* === 1. Left Column (Text & Buttons) === */}
                    <div className="flex flex-col gap-6">
                        <span className="font-semibold text-primary uppercase">
                            Vault42
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Experience hassle-free banking
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Experience simple, secure and stress-free banking. Say goodbye to
                            long queues and complex procedures and hello to hassle-free
                            banking with Vault42.
                        </p>

                        <div className="flex flex-row gap-4 mt-4">
                            <Button size="lg" asChild>
                                <Link href="/register">Get Started</Link>
                            </Button>

                            <Button variant="link" size="lg" asChild className="text-primary">
                                <Link href="/learn-more">Learn More &rarr;</Link>
                            </Button>
                        </div>
                    </div>

                    {/* === 2. Right Column (Images) === */}
                    <div className="relative">
                        <Image
                            src="/images/card-mockup.png"
                            alt="Credit Card"
                            width={400}
                            height={250}
                            className="relative z-10"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
