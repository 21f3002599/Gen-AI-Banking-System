import React from "react";
import ServiceCard from "./ServiceCard";

const Services = () => {
    const serviceData = [
        {
            icon: "/images/s-1.png",
            title: "Savings accounts",
            description:
                "Vault42 could offer a variety of savings accounts with different interest rates and terms, allowing customers to save money and earn interest over time.",
        },
        {
            icon: "/images/s-2.png",
            title: "Personal loans",
            description:
                "Vault42 could offer personal loans for a variety of purposes, such as debt consolidation, home improvements, or major purchases.",
        },
        {
            icon: "/images/s-3.png",
            title: "Credit cards",
            description:
                "Vault42 could offer credit cards with different rewards programs and benefits, such as cash back, travel rewards, or low interest rates.",
        },
        {
            icon: "/images/s-4.png",
            title: "Investment services",
            description:
                "Vault42 could offer investment services for customers looking to grow their wealth over time. This could include mutual funds, etc.",
        },
        {
            icon: "/images/s-5.png",
            title: "Online bill pay",
            description:
                "Vault42 could offer a convenient online bill pay service, allowing customers to pay bills and manage expenses from their computer or mobile device.",
        },
        {
            icon: "/images/s-6.png",
            title: "Business banking",
            description:
                "Vault42 could offer a range of banking services for small and medium-sized businesses, including checking accounts, business loans, etc.",
        },
    ];

    return (
        <section id="services" className="w-full bg-white py-16 md:py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold mb-12">Services</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {serviceData.map((service) => (
                        <ServiceCard
                            key={service.title}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
