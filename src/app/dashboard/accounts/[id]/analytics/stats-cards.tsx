import { TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart3 } from 'lucide-react';

export default function StatsCards({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total PnL */}
            <div className="stat-card text-foreground group">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total PnL</p>
                    <div className={`rounded-full p-2 ${Number(stats.totalPnL) >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        <DollarSign className="h-5 w-5" />
                    </div>
                </div>
                <p className={`text-3xl font-bold tracking-tight ${Number(stats.totalPnL) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${stats.totalPnL}
                </p>
                <div className="flex items-center gap-1 text-xs">
                    <span className={Number(stats.totalPnL) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Number(stats.totalPnL) >= 0 ? 'Profitable' : 'Drawdown'}
                    </span>
                </div>
            </div>

            {/* Win Rate */}
            <div className="stat-card text-foreground group">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Win Rate</p>
                    <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
                        <Target className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold tracking-tight text-foreground">{stats.winRate}%</p>
                    <p className="text-xs text-muted-foreground">/ 100%</p>
                </div>
                <p className="text-xs text-muted-foreground">Based on {stats.totalTrades} trades</p>
            </div>

            {/* Profit Factor */}
            <div className="stat-card text-foreground group">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Profit Factor</p>
                    <div className="rounded-full bg-purple-500/10 p-2 text-purple-600">
                        <Activity className="h-5 w-5" />
                    </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{stats.profitFactor}</p>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                            className="h-1.5 rounded-full bg-purple-500"
                            style={{ width: `${Math.min((Number(stats.profitFactor) / 3) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Avg Win / Loss Ratio */}
            <div className="stat-card text-foreground group">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Win/Loss</p>
                    <div className="rounded-full bg-orange-500/10 p-2 text-orange-600">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">${stats.avgWin}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Avg Win</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">${stats.avgLoss === '0.00' ? '-' : stats.avgLoss}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Avg Loss</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
