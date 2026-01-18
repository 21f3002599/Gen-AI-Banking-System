import React from "react";
import Image from "next/image";

interface ServiceCardProps {
    icon: string;
    title: string;
    description: string;
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => {
    return (
        <div className="flex flex-row gap-4">
            {/* Icon */}
            <div>
                <Image src={icon} alt={`${title} icon`} width={40} height={40} />
            </div>
            {/* Title & Description */}
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
};

export default ServiceCard;
