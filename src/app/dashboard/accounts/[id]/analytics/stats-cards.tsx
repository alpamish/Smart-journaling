import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

export default function StatsCards({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Total PnL */}
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Total PnL</p>
                    <DollarSign className={`h-4 w-4 ${Number(stats.totalPnL) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className={`mt-2 text-2xl font-bold ${Number(stats.totalPnL) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${stats.totalPnL}
                </p>
            </div>

            {/* Win Rate */}
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Win Rate</p>
                    <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats.winRate}%
                </p>
                <p className="text-xs text-gray-500">{stats.totalTrades} Trades</p>
            </div>

            {/* Profit Factor */}
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Profit Factor</p>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats.profitFactor}
                </p>
            </div>

            {/* Avg Win / Loss Ratio (Simplified visual) */}
            <div className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">Avg Win / Loss</p>
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                </div>
                <div className="mt-2 text-sm">
                    <span className="font-semibold text-green-600">${stats.avgWin}</span> / <span className="font-semibold text-red-600">${stats.avgLoss === '0.00' ? '-' : stats.avgLoss}</span>
                </div>
            </div>

        </div>
    );
}
