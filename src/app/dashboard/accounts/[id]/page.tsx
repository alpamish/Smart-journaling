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
        <div className="flex min-h-screen flex-col p-6">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{account.name}</h1>
                    <p className="text-gray-500">{account.type} Account</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Equity</p>
                    <p className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: account.currency,
                        }).format(account.equity)}
                    </p>
                </div>
            </header>

            {/* Analytics Overview */}
            {analytics && (
                <div className="mb-8 space-y-6">
                    <StatsCards stats={analytics.stats} />
                    <div className="grid gap-6 md:grid-cols-2">
                        <EquityChart data={analytics.equityCurve} />
                        <PnLChart data={analytics.equityCurve} />
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Stats Sidebar - keeping balance for now */}
                <div className="space-y-4 lg:col-span-1">
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-xl font-semibold">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: account.currency,
                            }).format(account.currentBalance)}
                        </p>
                    </div>
                    {/* Add more stats here later */}
                </div>

                {/* Main Content - Trade List */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Grid Strategy Section */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Active Grid Strategies</h2>
                            <CreateGridButton accountId={id} />
                        </div>
                        <GridList accountId={id} />
                    </div>

                    {/* Spot Holdings Section */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Spot Holdings</h2>
                            <AddHoldingButton accountId={id} />
                        </div>
                        <HoldingsList accountId={id} />
                    </div>

                    {/* Trades Section */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Trades</h2>
                            <LogTradeButton accountId={id} />
                        </div>

                        <div className="rounded-lg border bg-white shadow-sm">
                            {trades.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No trades logged yet. Start journaling!
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Symbol</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Side</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entry</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">PnL</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {trades.map((trade) => (
                                            <tr key={trade.id}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {new Date(trade.openTime).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {trade.symbol}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${trade.side === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {trade.side}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {trade.entryPrice}
                                                </td>
                                                <td className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${(trade.netPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {trade.netPnL ? `$${trade.netPnL.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {trade.status}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <CloseTradeButton trade={trade} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
