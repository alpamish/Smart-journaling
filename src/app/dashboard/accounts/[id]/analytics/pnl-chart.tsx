'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';

export default function PnLChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="text-gray-500 text-sm">Not enough data for chart</div>;
    }

    // Filter out the initial "Start" point which has 0 PnL and no real date context usually
    const chartData = data.filter(d => d.date !== 'Start');

    return (
        <div className="h-[300px] w-full rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Trade PnL</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value: number) => `$${value}`}
                    />
                    <Tooltip
                        formatter={(value: any) => [`$${value}`, 'PnL']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <ReferenceLine y={0} stroke="#9ca3af" />
                    <Bar dataKey="pnl">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#16a34a' : '#dc2626'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
