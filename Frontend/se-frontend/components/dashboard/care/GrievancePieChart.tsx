"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, Label, Legend, Cell } from "recharts";

interface GrievancePieChartProps {
    data: { name: string; value: number }[];
}

const COLORS = [
    "#FF6B6B", // Red for blocked/critical
    "#FFBB28", // Yellow for service issues
    "#00C49F", // Green
    "#0088FE", // Blue
    "#8884d8",
    "#FF8042",
];

export default function GrievancePieChart({ data }: GrievancePieChartProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => setActiveIndex(index);

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

    if (!data || data.length === 0) return (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No data available
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        stroke="none"
                        paddingAngle={5}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <Label
                            content={({ viewBox }) => {
                                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                                    return null;

                                const cx = viewBox.cx;
                                const cy = viewBox.cy;
                                const activeItem = data[activeIndex];

                                return (
                                    <g>
                                        <text
                                            x={cx}
                                            y={cy - 20}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#111827"
                                            fontSize="20px"
                                            fontWeight="bold"
                                        >
                                            {activeItem ? activeItem.value : 0}
                                        </text>
                                        <text
                                            x={cx}
                                            y={cy + 5}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#6B7280"
                                            fontSize="12px"
                                            fontWeight="500"
                                        >
                                            Issues
                                        </text>
                                    </g>
                                );
                            }}
                        />
                    </Pie>
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
