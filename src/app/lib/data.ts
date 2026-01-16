import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Account, Trade, GridStrategy, SpotHolding } from '@prisma/client';

export async function fetchUserAccounts(): Promise<Account[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const accounts = await prisma.account.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return accounts;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch accounts.');
    }
}

export async function fetchAccountById(id: string): Promise<Account | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const account = await prisma.account.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
        });
        return account;
    } catch (error) {
        console.error('Fetch Account Error:', error);
        return null;
    }
}

export async function fetchTradesByAccountId(accountId: string): Promise<Trade[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        // First verify ownership
        const account = await prisma.account.findUnique({
            where: {
                id: accountId,
                userId: session.user.id,
            },
        });

        if (!account) return [];

        const trades = await prisma.trade.findMany({
            where: {
                accountId,
            },
            orderBy: {
                entryDate: 'desc',
            },
        });
        return trades;

    } catch (error) {
        console.error('Fetch Trades Error:', error);
        return [];
    }
}

export async function fetchGridStrategies(accountId: string): Promise<GridStrategy[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const strategies = await prisma.gridStrategy.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
        });
        return strategies;
    } catch (error) {
        console.error('Fetch Grids Error:', error);
        return [];
    }
}

export async function fetchSpotHoldings(accountId: string): Promise<SpotHolding[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const holdings = await prisma.spotHolding.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
        });
        return holdings;
    } catch (error) {
        console.error('Fetch Holdings Error:', error);
        return [];
    }
}

export async function fetchAnalyticsData(accountId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const account = await prisma.account.findUnique({
            where: { id: accountId }
        });

        if (!account) return null;

        const trades = await prisma.trade.findMany({
            where: {
                accountId,
                status: 'CLOSED'
            },
            orderBy: { exitDate: 'asc' }
        });

        // 1. Calculate Stats
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => (t.netPnL || 0) > 0);
        const losingTrades = trades.filter(t => (t.netPnL || 0) <= 0);

        const grossProfit = winningTrades.reduce((sum, t) => sum + (t.netPnL || 0), 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.netPnL || 0), 0));

        const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0; // handle div by zero
        const totalPnL = grossProfit - grossLoss;

        const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;

        // 2. Build Equity Curve
        // Start point
        let runningBalance = account.initialBalance;
        const equityCurve = [{ date: 'Start', balance: runningBalance, pnl: 0 }];

        trades.forEach(trade => {
            const pnl = trade.netPnL || 0;
            runningBalance += pnl;
            // Simplified date for chart
            const dateStr = trade.exitDate ? new Date(trade.exitDate).toLocaleDateString() : 'N/A';

            equityCurve.push({
                date: dateStr,
                balance: runningBalance,
                pnl: pnl
            });
        });

        return {
            stats: {
                totalTrades,
                winRate: winRate.toFixed(1),
                profitFactor: profitFactor.toFixed(2),
                totalPnL: totalPnL.toFixed(2),
                avgWin: avgWin.toFixed(2),
                avgLoss: avgLoss.toFixed(2)
            },
            equityCurve
        };

    } catch (error) {
        console.error('Fetch Analytics Error:', error);
        return null;
    }
}
