'use client';

import React, { useState } from 'react';
import LogTradeButton from './log-trade-button';
import GridList from './grid/grid-list';
import CreateGridButton from './grid/create-grid-button';
import AddHoldingButton from './holdings/add-holding-button';
import HoldingsList from './holdings/holdings-list';
import OptimizedStatsCards from './analytics/optimized-stats-cards';
import OptimizedChart from './analytics/optimized-chart';
import OptimizedTradesTable from './optimized-trades-table';
import GlassSidebar, { ViewType } from './components/glass-sidebar';
import MobileSidebar from './components/mobile-sidebar';
import { Menu } from 'lucide-react';
import { Account, SpotHolding } from '@prisma/client';
import { TradeWithImages, AnalyticsData, Holding } from '@/app/lib/types';

interface AccountDashboardProps {
    accountId: string;
    account: Account;
    trades: TradeWithImages[];
    analytics: AnalyticsData;
    strategies: any[];
    holdings: Holding[];
}

export default function AccountDashboard({ accountId, account, trades, analytics, strategies, holdings }: AccountDashboardProps) {
    const [currentView, setCurrentView] = useState<ViewType>('analytics');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Calculate total grid profit from strategies
    const totalGridProfit = strategies.reduce((sum, s) => sum + (Number(s.totalProfit) || 0), 0);
    const totalGridStrategies = strategies.length;

    // Calculate realized holding PnL
    const totalRealizedHoldingPnL = holdings
        .filter(h => h.status === 'SOLD' && h.exitPrice)
        .reduce((sum, h) => sum + ((Number(h.exitPrice) - Number(h.avgEntryPrice)) * Number(h.quantity)), 0);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">

            <MobileSidebar
                accountId={accountId}
                currentView={currentView}
                onViewChange={setCurrentView}
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex flex-1 overflow-hidden">
                <GlassSidebar
                    accountId={accountId}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    className="hidden lg:flex flex-shrink-0 h-screen sticky top-0"
                    stats={{
                        winRate: analytics.stats?.winRate ? `${analytics.stats.winRate}%` : '0%',
                        totalPnL: analytics.stats?.totalPnL ? `$${Number(analytics.stats.totalPnL).toLocaleString()}` : '$0.00',
                        monthlyReturn: analytics.stats?.monthlyReturn ? `${Number(analytics.stats.monthlyReturn) >= 0 ? '+' : ''}${analytics.stats.monthlyReturn}%` : '+0.0%'
                    }}
                />

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden mb-6 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="view-content">
                            {currentView === 'grid' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Grid Strategies</h1>
                                            <p className="text-muted-foreground mt-1">Manage your automated trading grids and track performance</p>
                                        </div>
                                        <CreateGridButton accountId={accountId} account={account} />
                                    </div>

                                    {analytics && (
                                        <div className="grid gap-6 md:grid-cols-4">
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                        <span className="text-xl">🤖</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Active Grids</p>
                                                        <p className="text-2xl font-bold text-foreground">{strategies.filter((s: any) => s.status === 'ACTIVE').length}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                                        <span className="text-xl">📝</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Grid Strategies</p>
                                                        <p className="text-2xl font-bold text-foreground">{totalGridStrategies}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                                        <span className="text-xl">💰</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Grid P&L</p>
                                                        <p className={`sm:text-base lg:text-2xl md:text-lg font-bold ${totalGridProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {totalGridProfit >= 0 ? '+' : ''}${totalGridProfit.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                                        <span className="text-xl">📈</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Win Rate</p>
                                                        <p className="text-2xl font-bold text-foreground">
                                                            {analytics.stats?.winRate ? `${Number(analytics.stats.winRate).toFixed(1)}%` : '0%'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="section-card">
                                        <div className="p-6 border-b bg-muted/30">
                                            <h2 className="text-xl font-bold tracking-tight text-foreground">Active Grid Strategies</h2>
                                            <p className="text-sm text-muted-foreground mt-1">View and manage all your automated grid bots</p>
                                        </div>
                                        <div className="p-6">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            <GridList strategies={strategies as any[]} accountId={accountId} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentView === 'holdings' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Spot Holdings</h1>
                                            <p className="text-muted-foreground mt-1">Your current spot positions and investment portfolio</p>
                                        </div>
                                        <AddHoldingButton accountId={accountId} />
                                    </div>

                                    {analytics && (
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                                        <span className="text-xl">💎</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Total Holdings</p>
                                                        <p className="text-2xl font-bold text-foreground">
                                                            ${analytics.stats?.totalHoldings ? Number(analytics.stats.totalHoldings).toFixed(2) : '0.00'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                        <span className="text-xl">📊</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">24h Change</p>
                                                        <p className={`text-2xl font-bold ${Number(analytics.stats?.dailySpotChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {Number(analytics.stats?.dailySpotChange || 0) >= 0 ? '+' : '-'}${Math.abs(Number(analytics.stats?.dailySpotChange || 0)).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                                        <span className="text-xl">🎯</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Portfolio</p>
                                                        <p className="text-2xl font-bold text-foreground">
                                                            {String(analytics.stats?.portfolioCount || 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="section-card">
                                        <div className="p-6 border-b bg-muted/30">
                                            <h2 className="text-xl font-bold tracking-tight text-foreground">Your Holdings</h2>
                                            <p className="text-sm text-muted-foreground mt-1">Track all your spot positions and their performance</p>
                                        </div>
                                        <div className="p-6">
                                            <HoldingsList holdings={holdings} accountId={accountId} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentView === 'journal' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Trade Journal</h1>
                                            <p className="text-muted-foreground mt-1">Complete history of all your trades and entries</p>
                                        </div>
                                        <LogTradeButton accountId={accountId} balance={account.currentBalance} />
                                    </div>

                                    {analytics && (
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                                        <span className="text-xl">📝</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Total Trades</p>
                                                        <p className="text-2xl font-bold text-foreground">{String(analytics.stats?.total_parent_trade || 0)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                        <span className="text-xl">💰</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Net P&L</p>
                                                        <p className={`text-2xl font-bold ${(analytics.stats?.totalTradePnL && Number(analytics.stats.totalTradePnL) >= 0) ? 'text-green-500' : 'text-red-500'}`}>
                                                            ${analytics.stats?.totalTradePnL ? Number(analytics.stats.totalTradePnL).toFixed(2) : '0.00'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-card p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                                        <span className="text-xl">📈</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Win Rate</p>
                                                        <p className="text-2xl font-bold text-foreground">
                                                            {analytics.stats?.winRate ? `${Number(analytics.stats.winRate).toFixed(1)}%` : '0%'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="section-card">
                                        <div className="p-6 border-b bg-muted/30">
                                            <h2 className="text-xl font-bold tracking-tight text-foreground">Trade History</h2>
                                            <p className="text-sm text-muted-foreground mt-1">Detailed log of all your trades</p>
                                        </div>
                                        <div className="overflow-hidden">
                                            <OptimizedTradesTable trades={trades} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentView === 'analytics' && analytics && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Performance Analytics</h1>
                                            <p className="text-muted-foreground mt-1">Comprehensive metrics and charts for your trading performance</p>
                                        </div>
                                        <div className="flex gap-6 items-center px-4 py-3 bg-muted/40 rounded-2xl border border-border/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Initial Balance</span>
                                                <span className="text-lg font-bold text-foreground">${account.initialBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="h-8 w-px bg-border/50" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Balance</span>
                                                <span className="text-xl font-bold text-foreground">${account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="stat-card">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Strategies P&L</p>
                                            <p className={`text-3xl font-bold tracking-tight mt-2 ${Number(analytics.stats?.totalGridPnL || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {Number(analytics.stats?.totalGridPnL || 0) >= 0 ? '+' : '-'}${Math.abs(Number(analytics.stats?.totalGridPnL || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="stat-card">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Holding PNL</p>
                                            <p className={`text-3xl font-bold tracking-tight mt-2 ${Number(analytics.stats?.totalHoldingPnL || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {Number(analytics.stats?.totalHoldingPnL || 0) >= 0 ? '+' : '-'}${Math.abs(Number(analytics.stats?.totalHoldingPnL || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 pt-8 mt-4">
                                        <h2 className="text-lg font-bold text-foreground mb-4">Trade Journal Metrics</h2>
                                        <OptimizedStatsCards stats={analytics.stats as any} />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <OptimizedChart
                                            data={(analytics.equityCurve || []).map(item => ({
                                                date: item.date,
                                                value: item.balance
                                            }))}
                                            type="equity"
                                        />
                                        <OptimizedChart
                                            data={(analytics.equityCurve || []).map(item => ({
                                                date: item.date,
                                                value: item.pnl
                                            }))}
                                            type="pnl"
                                        />
                                        <OptimizedChart
                                            data={analytics.dayPerformance || []}
                                            type="bar"
                                            title="PnL by Day of Week"
                                        />
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-4">
                                        <div className="section-card p-6">
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">Max Drawdown</p>
                                                <p className="text-3xl font-bold text-red-500">
                                                    {analytics.stats?.maxDrawdown ? `${Number(analytics.stats.maxDrawdown).toFixed(2)}%` : '0%'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="section-card p-6">
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">Avg Trade P&L</p>
                                                <p className={`text-3xl font-bold ${(analytics.stats?.avgTradePnL && Number(analytics.stats.avgTradePnL) >= 0) ? 'text-green-500' : 'text-red-500'}`}>
                                                    ${analytics.stats?.avgTradePnL ? Number(analytics.stats.avgTradePnL).toFixed(2) : '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="section-card p-6">
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">Profit Factor</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {analytics.stats?.profitFactor ? Number(analytics.stats.profitFactor).toFixed(2) : '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="section-card p-6">
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">Total Days</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {String(analytics.stats?.totalDays || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
