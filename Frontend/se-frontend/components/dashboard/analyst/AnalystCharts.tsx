"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label, Sector } from "recharts";

const COLORS = {
    risk: ["#ef4444", "#f59e0b", "#10b981"], // High (Red), Med (Orange), Low (Green)
    status: ["#10b981", "#ef4444", "#6b7280"] // Active (Green), Blocked (Red), Inactive (Gray)
};

interface ChartProps {
    data: any[];
    title: string;
    type: "risk" | "status";
}

export default function AnalystPieChart({ data, title, type }: ChartProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 8}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={outerRadius + 10}
                    outerRadius={outerRadius + 18}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.3}
                />
            </g>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
            <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
            <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            // @ts-ignore
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[type][index % COLORS[type].length]}
                                // stroke="none" // Moved to Pie component
                                />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                                    const cx = viewBox.cx;
                                    const cy = viewBox.cy;
                                    const activeItem = data[activeIndex];

                                    return (
                                        <g>
                                            <text
                                                x={cx}
                                                y={cy! - 20}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill="#111827"
                                                fontSize="24px"
                                                fontWeight="bold"
                                            >
                                                {activeItem ? activeItem.value : 0}
                                            </text>
                                            <text
                                                x={cx}
                                                y={cy! + 5}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill="#6B7280"
                                                fontSize="12px"
                                                fontWeight="500"
                                            >
                                                {activeItem ? activeItem.name : "Total"}
                                            </text>
                                        </g>
                                    );
                                }}
                            />
                        </Pie>
                        <Tooltip />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="text-sm font-medium text-gray-600 ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text (Total) */}
                {/* Removed as per instruction to use Recharts Label */}
            </div>
        </div>
    );
}

