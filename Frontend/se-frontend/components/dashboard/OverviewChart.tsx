"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface OverviewChartProps {
    data: {
        name: string;
        credit: number;
        debit: number;
    }[];
}

const OverviewChart = ({ data }: OverviewChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ fontSize: "14px", fontWeight: 500 }}
                    cursor={{ fill: "#F3F4F6" }}
                />
                <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "20px" }}
                />
                <Bar
                    dataKey="credit"
                    name="Income"
                    fill="#24b281"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
                <Bar
                    dataKey="debit"
                    name="Expense"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default OverviewChart;
