"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, Label, Legend } from "recharts";

interface SpendingPieChartProps {
    data: Record<string, number>;
}

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
];

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const chartData = useMemo(() => {
        return Object.entries(data).map(([name, value], index) => ({
            name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            value,
            fill: COLORS[index % COLORS.length],
        }));
    }, [data]);

    const onPieEnter = (_: any, index: number) => setActiveIndex(index);

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={outerRadius + 12}
                    outerRadius={outerRadius + 22}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.3}
                />
            </g>
        );
    };

    if (!chartData.length) return null;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={chartData}
                        cx="40%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        stroke="none"
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                                    return null;

                                const cx = viewBox.cx;
                                const cy = viewBox.cy;

                                return (
                                    <g>
                                        <text
                                            x={cx - 94}
                                            y={cy - 10}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#111827"
                                            fontSize="24px"
                                            fontWeight="bold"
                                        >
                                            ₹{chartData[activeIndex].value.toLocaleString()}
                                        </text>
                                        <text
                                            x={cx - 94}
                                            y={cy + 18}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill="#374151"
                                            fontSize="14px"
                                            fontWeight="500"
                                        >
                                            {chartData[activeIndex].name}
                                        </text>
                                    </g>
                                );
                            }}
                        />
                    </Pie>
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
