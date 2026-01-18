'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Tag, Calendar, Timer, Clock } from 'lucide-react';
import TradeDetailButton from './trade-detail-button';
import CloseTradeButton from './close-trade-button';
import { Trade, Image as TradeImage } from '@prisma/client';

type TradeWithImages = Trade & {
    images: TradeImage[];
    parentId?: string | null;
};

export default function TradesTable({ trades }: { trades: TradeWithImages[] }) {
    const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());

    // Grouping Logic: Separate parent trades and group their children
    const parentTrades = trades.filter(t => !t.parentId);
    const childTrades = trades.filter(t => t.parentId);

    const toggleTrade = (id: string) => {
        const next = new Set(expandedTrades);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedTrades(next);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        <th className="w-10 px-4 py-4"></th>
                        <th className="px-6 py-4 font-semibold text-foreground">Date</th>
                        <th className="px-6 py-4 font-semibold text-foreground">Symbol</th>
                        <th className="px-6 py-4 font-semibold text-foreground text-right">Qty</th>
                        <th className="px-6 py-4 font-semibold text-foreground">Side</th>
                        <th className="px-6 py-4 font-semibold text-foreground text-right">Entry</th>
                        <th className="px-6 py-4 font-semibold text-foreground text-right">PnL</th>
                        <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                        <th className="px-6 py-4 font-semibold text-foreground text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                    {parentTrades.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                                No trades logged yet.
                            </td>
                        </tr>
                    ) : (
                        parentTrades.map((trade) => {
                            const children = childTrades.filter(c => c.parentId === trade.id);
                            const hasChildren = children.length > 0;
                            const isExpanded = expandedTrades.has(trade.id);

                            return (
                                <React.Fragment key={trade.id}>
                                    <tr className="group transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-4 text-center">
                                            {hasChildren && (
                                                <button
                                                    onClick={() => toggleTrade(trade.id)}
                                                    className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                                                >
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </button>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                                            {new Date(trade.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-bold text-foreground">
                                            {trade.symbol}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-muted-foreground text-xs uppercase">
                                            {trade.quantity.toLocaleString()} Units
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
                                            <div className="flex justify-end gap-2">
                                                <TradeDetailButton trade={trade} children={children} />
                                                <CloseTradeButton trade={trade} />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* History Rows */}
                                    {isExpanded && children.map((child) => (
                                        <tr key={child.id} className="bg-muted/10 border-l-4 border-primary/30 text-xs">
                                            <td className="px-4 py-3"></td>
                                            <td className="px-6 py-3 text-muted-foreground">
                                                {new Date(child.exitDate || child.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-3 font-medium text-foreground italic flex items-center gap-2">
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">Exited</span>
                                                {child.exitQuantity?.toLocaleString()} {trade.symbol}
                                            </td>
                                            <td className="px-6 py-3"></td>
                                            <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                                                @ ${child.exitPrice?.toLocaleString()}
                                            </td>
                                            <td className={`px-6 py-3 text-right font-bold tabular-nums ${(child.netPnL || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {(child.netPnL || 0) >= 0 ? '+' : ''}${child.netPnL?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-[10px] text-muted-foreground uppercase font-medium">Partial Out</span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <TradeDetailButton trade={child} />
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
