'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight, TrendingUp, TrendingDown, Info, Tag, MessageSquare, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Trade, Image as TradeImage } from '@prisma/client';

interface TradeWithImages extends Trade {
    images: TradeImage[];
}

export default function TradeDetailModal({
    trade,
    onClose
}: {
    trade: TradeWithImages,
    onClose: () => void
}) {
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const isWin = (trade.netPnL || 0) > 0;

    // Keyboard navigation for image viewer
    useEffect(() => {
        if (!imageViewerOpen || !trade.images) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : trade.images.length - 1));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev < trade.images.length - 1 ? prev + 1 : 0));
                    break;
                case 'Escape':
                    e.preventDefault();
                    setImageViewerOpen(false);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [imageViewerOpen, trade.images, currentImageIndex]);

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{trade.symbol}</h2>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${trade.side === 'LONG'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                    }`}>
                                    {trade.side}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${trade.status === 'OPEN'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {trade.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Logged on {new Date(trade.createdAt).toLocaleDateString()} at {new Date(trade.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left">
                        {/* Performance Summary */}
                        {trade.status === 'CLOSED' && (
                            <div className={`p-6 rounded-2xl border flex items-center justify-between ${isWin
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'
                                }`}>
                                <div>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>Realized PnL</span>
                                    <div className={`text-3xl font-mono font-bold mt-1 ${isWin ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                        {isWin ? '+' : ''}{trade.netPnL?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        <span className="text-sm ml-1 font-normal opacity-70">USD</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-2 text-xl font-bold ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {isWin ? <TrendingUp /> : <TrendingDown />}
                                        {Math.abs(trade.netPnLPercent || 0).toFixed(2)}%
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">On Margin Used</p>
                                </div>
                            </div>
                        )}

                        {/* Entry/Exit Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Entry Details */}
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                    Entry Details
                                </div>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Price</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">${trade.entryPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Quantity</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{trade.quantity.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Leverage</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{trade.leverage}X ({trade.marginMode})</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Margin Used</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">${trade.marginUsed?.toLocaleString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Entry Date & Time</span>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(trade.entryDate).toLocaleString()}
                                        </p>
                                    </div>
                                    {trade.entryCondition && (
                                        <div className="col-span-2">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Entry Condition</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Tag className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-bold">{trade.entryCondition}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Exit Details */}
                            <div className={`space-y-4 p-5 rounded-2xl border ${trade.status === 'CLOSED'
                                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                                : 'bg-slate-50/30 dark:bg-slate-800/20 border-dashed border-slate-200 dark:border-slate-700'
                                }`}>
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trade.status === 'CLOSED' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                        }`}>
                                        <TrendingDown className="w-4 h-4 rotate-180" />
                                    </div>
                                    Exit Details
                                </div>
                                {trade.status === 'CLOSED' ? (
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Price</span>
                                            <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">${trade.exitPrice?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Quantity</span>
                                            <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{trade.exitQuantity?.toLocaleString()}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Exit Date & Time</span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {trade.exitDate ? new Date(trade.exitDate).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                        {trade.exitCondition && (
                                            <div className="col-span-2">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">Exit Condition</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                                                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded text-xs font-bold">{trade.exitCondition}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                        <Info className="w-8 h-8 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-400">Position remains open.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Risk Management */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-[10px]">
                                Risk Management
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-start text-left">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Stop Loss</span>
                                    <p className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">{trade.stopLoss ? `$${trade.stopLoss.toLocaleString()}` : 'Not Set'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Take Profit</span>
                                    <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{trade.takeProfit ? `$${trade.takeProfit.toLocaleString()}` : 'Not Set'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Timeframe (Analysis)</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{trade.analysisTimeframe || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Timeframe (Entry)</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{trade.entryTimeframe || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        {trade.remarks && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Remarks & Notes
                                </div>
                                <div className="p-4 text-left rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                    &ldquo;{trade.remarks}&rdquo;
                                </div>
                            </div>
                        )}

                        {/* Images Section */}
                        {trade.images && trade.images.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Performance Evidence ({trade.images.length})
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {trade.images.map((img, index) => (
                                        <div key={img.id} className="relative group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md cursor-pointer" onClick={() => {
                                            setCurrentImageIndex(index);
                                            setImageViewerOpen(true);
                                        }}>
                                            <img
                                                src={img.url}
                                                alt="Trade Evidence"
                                                className="w-full h-auto object-cover max-h-64 transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    View Full Size
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                        >
                            Close Detail View
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {imageViewerOpen && trade.images && (
                <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setImageViewerOpen(false)}>
                    <div className="relative max-w-full max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setImageViewerOpen(false)}
                            className="absolute top-4 right-4 z-10 rounded-full p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Navigation Arrows */}
                        {trade.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : trade.images.length - 1));
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev < trade.images.length - 1 ? prev + 1 : 0));
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </>
                        )}

                        {/* Image */}
                        <img
                            src={trade.images[currentImageIndex].url}
                            alt={`Trade Evidence ${currentImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain transition-opacity duration-300"
                        />

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {currentImageIndex + 1} of {trade.images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
