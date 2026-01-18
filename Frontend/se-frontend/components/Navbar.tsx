"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Logo from "@/components/Logo";

const Navbar = () => {
    return (
        <header className="w-full">
            <nav className="container mx-auto flex items-center justify-between px-4 py-4">
                {/* === 1. Logo === */}
                <Logo />

                {/* === 2. Navigation Links === */}
                <NavigationMenu>
                    <NavigationMenuList>
                        {/* Home */}
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/" className="px-4 py-2 text-sm font-medium">
                                    Home
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Services */}
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="#services"
                                    className="px-4 py-2 text-sm font-medium"
                                >
                                    Services
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Contact Us */}
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="#footer" className="px-4 py-2 text-sm font-medium">
                                    Contact Us
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* === 3. Login Button === */}
                <Button className="bg-[#288F69] text-white">
                    <Link href="/login">Login</Link>
                </Button>
            </nav>
        </header>
    );
};

export default Navbar;
