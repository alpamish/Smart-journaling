'use client';

import React, { memo, useMemo, useCallback, useRef } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Area,
    AreaChart,
} from 'recharts';

interface ChartDataPoint {
    date: string;
    value: number;
    timestamp?: string;
}

interface OptimizedChartProps {
    data: ChartDataPoint[];
    type: 'equity' | 'pnl';
    height?: number;
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label, type }: { active?: boolean; payload?: any[]; label?: string; type: string }) => {
    if (active && payload && payload[0]) {
        const value = payload[0].value;
        const isPositive = value >= 0;
        
        return (
            <div className="premium-card p-3 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className={`font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {type === 'pnl' ? 
                        (isPositive ? '+$' : '-$') + Math.abs(value).toLocaleString() :
                        '$' + value.toLocaleString()
                    }
                </p>
            </div>
        );
    }
    return null;
};



export default memo(function OptimizedChart({ data, type, height = 300, isLoading }: OptimizedChartProps) {
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    
    // Memoize processed data
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        return data.map(point => ({
            ...point,
            displayDate: new Date(point.date).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric' 
            }),
            displayValue: Number(point.value || 0)
        }));
    }, [data]);

    // Memoize chart configuration
    const chartConfig = useMemo(() => {
        const isPositive = processedData.length > 0 ? 
            processedData[processedData.length - 1].displayValue >= 0 : true;
            
        return {
            strokeColor: type === 'equity' ? '#3b82f6' : (isPositive ? '#10b981' : '#ef4444'),
            fillColor: type === 'equity' ? 
                'url(#equityGradient)' : 
                (isPositive ? 'url(#pnlGreenGradient)' : 'url(#pnlRedGradient)'),
        };
    }, [processedData, type]);

    // Debounced resize handler
    const handleResize = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        
        debounceRef.current = setTimeout(() => {
            // Trigger chart re-render
            window.dispatchEvent(new Event('resize'));
        }, 250);
    }, []);

    React.useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [handleResize]);

    if (isLoading) {
        return (
            <div className="premium-card p-6 animate-pulse">
                <div className="h-64 bg-muted rounded"></div>
            </div>
        );
    }

    if (!processedData || processedData.length === 0) {
        return (
            <div className="premium-card p-6">
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className="premium-card p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
                {type === 'equity' ? 'Equity Curve' : 'P&L Chart'}
            </h3>
            
            <ResponsiveContainer width="100%" height={height}>
                {type === 'equity' ? (
                    <AreaChart data={processedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                            dataKey="displayDate" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip content={<CustomTooltip type={type} />} />
                        <Area
                            type="monotone"
                            dataKey="displayValue"
                            stroke={chartConfig.strokeColor}
                            strokeWidth={2}
                            fill={chartConfig.fillColor}
                        />
                    </AreaChart>
                ) : (
                    <LineChart data={processedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                            dataKey="displayDate" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => {
                                const isPositive = value >= 0;
                                return (isPositive ? '+' : '') + '$' + value.toLocaleString();
                            }}
                        />
                        <Tooltip content={<CustomTooltip type={type} />} />
                        <Line
                            type="monotone"
                            dataKey="displayValue"
                            stroke={chartConfig.strokeColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
});