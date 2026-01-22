import { Trade, Image, SpotHolding, Account } from '@prisma/client';

export interface TradeWithImages extends Trade {
    images: Image[];
}

export interface Holding extends SpotHolding {
    // Add any extra fields if needed, but Prisma types usually suffice
}

export interface AnalyticsData {
    stats: {
        totalTrades?: number;
        totalTradesCount?: number;
        winRate?: string;
        profitFactor?: string;
        totalPnL?: string;
        monthlyReturn?: string;
        avgWin?: string;
        avgLoss?: string;
        netPnL?: string;
        totalHoldings?: string;
        dailyChange?: string;
        portfolioCount?: number;
        maxDrawdown?: string;
        avgTradePnL?: string;
        totalDays?: number;
    };
    equityCurve: any[];
}
