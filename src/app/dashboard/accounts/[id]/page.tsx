import { fetchAccountById, fetchTradesByAccountId } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import LogTradeButton from './log-trade-button';
import GridList from './grid/grid-list';
import CreateGridButton from './grid/create-grid-button';
import AddHoldingButton from './holdings/add-holding-button';
import HoldingsList from './holdings/holdings-list';
import StatsCards from './analytics/stats-cards';
import EquityChart from './analytics/equity-chart';
import PnLChart from './analytics/pnl-chart';
import CloseTradeButton from './close-trade-button';
import { fetchAnalyticsData } from '@/app/lib/data';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const account = await fetchAccountById(id);
    const trades = await fetchTradesByAccountId(id);
    const analytics = await fetchAnalyticsData(id);

    if (!account) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-primary px-6 py-12 text-primary-foreground md:px-12 md:py-16">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                {account.type} Account
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{account.name}</h1>
                        </div>
                        <div className="flex flex-col items-start gap-1 md:items-end">
                            <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/60">Current Equity</p>
                            <p className="text-4xl font-bold md:text-5xl">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: account.currency,
                                }).format(account.equity)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
                {/* Analytics Overview */}
                {analytics && (
                    <div className="mb-12 space-y-8">
                        <StatsCards stats={analytics.stats} />
                        <div className="grid gap-6 md:grid-cols-2">
                            <EquityChart data={analytics.equityCurve} />
                            <PnLChart data={analytics.equityCurve} />
                        </div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-4">
                    {/* Sidebar / Secondary Stats */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="premium-card">
                            <h3 className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Balance</h3>
                            <p className="text-2xl font-bold text-foreground">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: account.currency,
                                }).format(account.currentBalance)}
                            </p>
                            <div className="mt-4 border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Initial Balance</span>
                                    <span className="font-medium text-foreground">${account.initialBalance}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions or more stats could go here */}
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* Grid Strategy Section */}
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">Active Grid Strategies</h2>
                                <CreateGridButton accountId={id} />
                            </div>
                            <GridList accountId={id} />
                        </section>

                        {/* Spot Holdings Section */}
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">Spot Holdings</h2>
                                <AddHoldingButton accountId={id} />
                            </div>
                            <HoldingsList accountId={id} />
                        </section>

                        {/* Trades Section */}
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">Trade Journal</h2>
                                <LogTradeButton accountId={id} />
                            </div>

                            <div className="premium-card overflow-hidden !p-0">
                                {trades.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                        <div className="mb-4 rounded-full bg-muted p-4">
                                            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-lg font-medium text-foreground">No trades logged yet</p>
                                        <p className="text-sm">Start your journaling journey today.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead className="bg-muted/50 border-b border-border">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold text-foreground">Date</th>
                                                    <th className="px-6 py-4 font-semibold text-foreground">Symbol</th>
                                                    <th className="px-6 py-4 font-semibold text-foreground">Side</th>
                                                    <th className="px-6 py-4 font-semibold text-foreground text-right">Entry</th>
                                                    <th className="px-6 py-4 font-semibold text-foreground text-right">PnL</th>
                                                    <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                                                    <th className="px-6 py-4 font-semibold text-foreground text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border bg-card">
                                                {trades.map((trade) => (
                                                    <tr key={trade.id} className="group transition-colors hover:bg-muted/30">
                                                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                                                            {new Date(trade.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 font-bold text-foreground">
                                                            {trade.symbol}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${trade.side === 'LONG' ? 'bg-green-500/10 text-green-600 ring-green-600/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 ring-red-600/20 dark:text-red-400'
                                                                }`}>
                                                                {trade.side}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-muted-foreground">
                                                            ${trade.entryPrice.toLocaleString()}
                                                        </td>
                                                        <td className={`whitespace-nowrap px-6 py-4 text-right font-bold tabular-nums ${(trade.netPnL || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                            {trade.netPnL ? (trade.netPnL >= 0 ? `+$${trade.netPnL.toLocaleString()}` : `-$${Math.abs(trade.netPnL).toLocaleString()}`) : '-'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${trade.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                                {trade.status}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                                            <CloseTradeButton trade={trade} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
