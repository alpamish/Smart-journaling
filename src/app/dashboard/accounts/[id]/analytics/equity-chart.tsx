'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function EquityChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="text-gray-500 text-sm">Not enough data for chart</div>;
    }

    return (
        <div className="h-[300px] w-full rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Equity Curve</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value: number) => `$${value}`}
                    />
                    <Tooltip
                        formatter={(value: any) => [`$${value}`, 'Balance']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        animationDuration={1000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
