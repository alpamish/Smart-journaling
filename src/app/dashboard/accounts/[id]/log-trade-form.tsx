'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
import { createTrade, getTradeConditions } from '@/app/lib/actions';
import { TradeCondition } from '@prisma/client';
import { Search } from 'lucide-react';
import SymbolSelector from './grid/symbol-selector';
import './log-trade-form.css';

export default function LogTradeForm({ accountId, balance, close }: { accountId: string, balance: number, close: () => void }) {
    const createTradeWithId = createTrade.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createTradeWithId, null);

    // Form State for dynamic logic
    const [segment, setSegment] = useState('CRYPTO');
    const [symbol, setSymbol] = useState<string>('');
    const [showSymbolSelector, setShowSymbolSelector] = useState<boolean>(false);
    const [currentPrice, setCurrentPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [entryPrice, setEntryPrice] = useState<number>(0);
    const [leverage, setLeverage] = useState<number>(3);
    const [exitPrice, setExitPrice] = useState<number>(0);
    const [exitQuantity, setExitQuantity] = useState<number>(0);
    const [exitQuantityPercent, setExitQuantityPercent] = useState<number>(0);
    const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

    // Conditions State
    const [entryConditions, setEntryConditions] = useState<TradeCondition[]>([]);
    const [exitConditions, setExitConditions] = useState<TradeCondition[]>([]);
    const [imageCount, setImageCount] = useState(0);
    const [imagePreviews, setImagePreviews] = useState<{ file: File, preview: string, progress: number }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d', '3d', '1w', '1M'];
    const DEFAULT_CONDITIONS = {
        ENTRY: [
            'Accurate Entry', 'Early Entry', 'FOMO', 'Trendline Breakout', 'Double Bottom',
            'Double Top', 'EMA Cross', 'RSI Divergence', 'Support Bounce', 'Resistance Breakout',
            'Golden Cross', 'Death Cross', 'Trendline Reject', 'Oversold RSI', 'Overbought RSI',
            'Patience rewarded', 'Chased entry', 'News event', 'Rule based', 'Impulse trade'
        ],
        EXIT: [
            // Standard Hits
            'Target Hit', 'Stop Loss Hit', 'Manual Exit', 'Trailing Stop',
            // Technical Reasons
            'Trend Reversal', 'Resistance Reject', 'Support Break', 'Exhaustion Candle',
            'Double Top Confirm', 'Double Bottom Confirm', 'Divergence Confirmation',
            'Indicator Overlap', 'Squeeze Play Over', 'Volume Climax', 'Invalid Setup',
            'Lower High formed', 'Higher Low broken', 'EMA 200 Reject', 'VWAP Reject',
            'Parabolic Blowoff', 'Mean Reversion', 'Liquidity Sweep',
            // Time & Strategy
            'Time Based Exit', 'End of Session', 'Risk Reduction', 'Scaling Out',
            'Fundamental Shift', 'Economic Data Release', 'Profit Protecting',
            // Psychological
            'Emotional Exit', 'Fear based', 'Greed based', 'Lost Confidence',
            'Impatience', 'Distraction', 'Second Guessing'
        ]
    };

    useEffect(() => {
        const fetchConditions = async () => {
            const entry = await getTradeConditions('ENTRY');
            const exit = await getTradeConditions('EXIT');
            setEntryConditions(entry);
            setExitConditions(exit);
        };
        fetchConditions();
    }, []);

    useEffect(() => {
        if (state?.success) {
            close();
            // Reset form state after successful submission
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setImagePreviews([]);
            setImageCount(0);
            setIsUploading(false);
        }
    }, [state, close]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPending) {
            setIsUploading(true);
            // Simulate upload progress
            interval = setInterval(() => {
                setImagePreviews(prev =>
                    prev.map(preview => ({
                        ...preview,
                        progress: Math.min(preview.progress + Math.random() * 20, 90)
                    }))
                );
            }, 200);
        } else {
            setIsUploading(false);
            // Complete progress on success
            if (imagePreviews.length > 0) {
                setImagePreviews(prev =>
                    prev.map(preview => ({ ...preview, progress: 100 }))
                );
            }
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPending, imagePreviews.length]);

    // Auto-calculations
    const amountAfterLeverage = useMemo(() => quantity * entryPrice, [quantity, entryPrice]);
    const marginUsed = useMemo(() => (leverage > 0 ? amountAfterLeverage / leverage : 0), [amountAfterLeverage, leverage]);

    const pnl = useMemo(() => {
        if (!exitPrice || !entryPrice || !quantity) return 0;
        return side === 'LONG'
            ? (exitPrice - entryPrice) * quantity
            : (entryPrice - exitPrice) * quantity;
    }, [exitPrice, entryPrice, quantity, side]);

    const pnlPercent = useMemo(() => {
        if (!pnl || !marginUsed) return 0;
        return (pnl / marginUsed) * 100;
    }, [pnl, marginUsed]);

    const liquidationPrice = useMemo(() => {
        if (!entryPrice || !leverage || leverage <= 0) return 0;
        // maintenance margin rate (0.1% to allow higher leverage without immediately liquidating)
        const mm = 0.001;

        if (side === 'LONG') {
            // LiqPrice = EntryPrice * (1 - 1/leverage + mm)
            let lp = entryPrice * (1 - (1 / leverage) + mm);
            return Math.max(0, lp);
        } else {
            // LiqPrice = EntryPrice * (1 + 1/leverage - mm)
            let lp = entryPrice * (1 + (1 / leverage) - mm);
            return Math.max(0, lp);
        }
    }, [entryPrice, leverage, side]);

    const isOverMargin = marginUsed > balance;

    const exitQuantityPnL = useMemo(() => {
        if (!exitPrice || !entryPrice || !exitQuantity) return 0;
        return side === 'LONG'
            ? (exitPrice - entryPrice) * exitQuantity
            : (entryPrice - exitPrice) * exitQuantity;
    }, [exitPrice, entryPrice, exitQuantity, side]);

    const handleSliderChange = (percent: number) => {
        setExitQuantityPercent(percent);
        const calculatedQuantity = (quantity * percent) / 100;
        setExitQuantity(calculatedQuantity);
        const input = document.querySelector('input[name="exitQuantity"]') as HTMLInputElement;
        if (input) {
            input.value = calculatedQuantity.toString();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const handleSymbolSelect = (selectedSymbol: string, price: string) => {
        setSymbol(selectedSymbol);
        setCurrentPrice(price);
        // Auto-fill entry price with current market price if not already set
        if (!entryPrice || entryPrice === 0) {
            setEntryPrice(parseFloat(price));
            const input = document.querySelector('input[name="entryPrice"]') as HTMLInputElement;
            if (input) {
                input.value = price;
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Limit to 3 images total (including already selected)
        const totalImages = imagePreviews.length + files.length;
        const filesToProcess = totalImages > 3
            ? files.slice(0, 3 - imagePreviews.length)
            : files;

        if (totalImages > 3) {
            alert('You can only upload up to 3 images.');
        }

        const validFiles = filesToProcess.filter(file => {
            const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
            return isValidType && isValidSize;
        });

        const previews = await Promise.all(validFiles.map(async (file) => {
            return new Promise<{ file: File, preview: string, progress: number }>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        file,
                        preview: e.target?.result as string,
                        progress: 0
                    });
                };
                reader.readAsDataURL(file);
            });
        }));

        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(formData: FormData) {
        // Clear any existing images from the native form submission to avoid duplicates
        // Note: FormData.delete isn't always available in all environments, 
        // but it's safe in modern browsers.
        formData.delete('images');

        // Append all files from imagePreviews state
        imagePreviews.forEach(preview => {
            formData.append('images', preview.file);
        });

        formAction(formData);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Log Futures Trade</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Record a new derivatives entry across any asset class.</p>
                    </div>
                    <button onClick={close} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-8">
                    {/* Setup Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">1. Trade Setup</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Segment</label>
                                <select
                                    name="segment"
                                    value={segment}
                                    onChange={(e) => setSegment(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="CRYPTO">Crypto</option>
                                    <option value="STOCK">Stock</option>
                                    <option value="FOREX">Forex</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Mode</label>
                                <select name="marginMode" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all">
                                    <option value="ISOLATED">Isolated</option>
                                    <option value="CROSS">Cross</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Trade Type</label>
                                <select name="tradeType" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all">
                                    <option value="SCALPING">Scalping</option>
                                    <option value="INTRADAY">Intraday</option>
                                    <option value="SWING">Swing</option>
                                    <option value="POSITIONAL">Positional</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Session</label>
                                <select name="session" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all">
                                    <option value="MORNING">Morning</option>
                                    <option value="AFTERNOON">Afternoon</option>
                                    <option value="EVENING">Evening</option>
                                    <option value="NIGHT">Night</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Entry Details Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">2. Entry Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Symbol</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="symbol"
                                            value={symbol}
                                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                            onFocus={() => setShowSymbolSelector(true)}
                                            required
                                            placeholder="Click to browse pairs"
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 pr-10 focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                                        />
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    {currentPrice && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Current: <span className="font-semibold text-slate-700 dark:text-slate-300">${parseFloat(currentPrice).toLocaleString()}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Side</label>
                                    <select
                                        name="side"
                                        value={side}
                                        onChange={(e) => setSide(e.target.value as 'LONG' | 'SHORT')}
                                        className={`w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-bold ${side === 'LONG' ? 'text-emerald-600' : 'text-rose-600'}`}
                                    >
                                        <option value="LONG">LONG</option>
                                        <option value="SHORT">SHORT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Entry Price</label>
                                    <input
                                        type="number"
                                        name="entryPrice"
                                        step="any"
                                        required
                                        onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Entry Date</label>
                                    <input type="datetime-local" name="entryDate" defaultValue={new Date().toISOString().slice(0, 16)} className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Analysis Timeframe</label>
                                    <select name="analysisTimeframe" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                                        {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Entry Timeframe</label>
                                    <select name="entryTimeframe" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                                        {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Entry Condition</label>
                            <select
                                name="entryCondition"
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <option value="">Select condition...</option>
                                {entryConditions.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                                {DEFAULT_CONDITIONS.ENTRY.filter(name => !entryConditions.some(c => c.name === name)).map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* Risk & Position Management */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">3. Risk & Position</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Stop Loss</label>
                                <input type="number" name="stopLoss" step="any" className="w-full rounded-lg border-rose-100 dark:border-rose-900/30 dark:bg-rose-900/20 text-rose-600 p-2.5 focus:ring-2 focus:ring-rose-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target (TP)</label>
                                <input type="number" name="takeProfit" step="any" className="w-full rounded-lg border-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/20 text-emerald-600 p-2.5 focus:ring-2 focus:ring-emerald-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Quantity (Size)</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    step="any"
                                    required
                                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Leverage (x)</label>
                                <input
                                    type="number"
                                    name="leverage"
                                    min="1"
                                    defaultValue="3"
                                    onChange={(e) => setLeverage(parseFloat(e.target.value) || 3)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount After Leverage</span>
                                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                                    {amountAfterLeverage.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">USD</span>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border transition-colors ${isOverMargin
                                ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50'
                                : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'}`}>
                                <span className={`text-xs font-bold uppercase ${isOverMargin ? 'text-rose-500' : 'text-blue-500 dark:text-blue-400'}`}>Margin Required</span>
                                <div className={`text-xl font-mono font-bold mt-1 ${isOverMargin ? 'text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
                                    {marginUsed.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal opacity-70">USD</span>
                                </div>
                                {isOverMargin && (
                                    <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-tight animate-pulse">Insufficient Balance</p>
                                )}
                            </div>
                            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                <span className="text-xs font-bold text-orange-500 dark:text-orange-400 uppercase">Est. Liquidation Price</span>
                                <input type="hidden" name="liquidationPrice" value={liquidationPrice} />
                                <div className="text-xl font-mono font-bold text-orange-600 dark:text-orange-400 mt-1">
                                    ${liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Exit Details Section (Optional for logging open trade) */}
                    <section>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">4. Exit Details (Optional)</h3>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase font-bold text-slate-500">Close Trade Now</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Price</label>
                                <input
                                    type="number"
                                    name="exitPrice"
                                    step="any"
                                    onChange={(e) => setExitPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Quantity</label>
                                <input
                                    type="number"
                                    name="exitQuantity"
                                    step="any"
                                    value={exitQuantity}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setExitQuantity(val);
                                        if (quantity > 0) {
                                            setExitQuantityPercent((val / quantity) * 100);
                                        }
                                    }}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                {quantity > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>0%</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{exitQuantityPercent.toFixed(0)}%</span>
                                            <span>100%</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={exitQuantityPercent}
                                                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                                                style={{
                                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${exitQuantityPercent}%, #e2e8f0 ${exitQuantityPercent}%, #e2e8f0 100%)`
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>{exitQuantity.toFixed(4)} units</span>
                                            <span>of {quantity.toFixed(4)} total</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Condition</label>
                                <select
                                    name="exitCondition"
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">Select condition...</option>
                                    {exitConditions.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                    {DEFAULT_CONDITIONS.EXIT.filter(name => !exitConditions.some(c => c.name === name)).map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Date / Time</label>
                                <input
                                    type="datetime-local"
                                    name="exitDate"
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Performance & Review */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">5. Performance & Review</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className={`p-6 rounded-2xl border ${pnl >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'}`}>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className={`text-xs font-bold uppercase ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Estimated PnL</span>
                                            <div className={`text-3xl font-mono font-bold mt-1 ${pnl >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                                {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div className={`text-xl font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {pnl >= 0 ? '▲' : '▼'} {Math.abs(pnlPercent).toFixed(2)}%
                                        </div>
                                    </div>
                                    {entryPrice > 0 && exitPrice > 0 && (
                                        <div className="mt-2 text-[10px] font-mono opacity-50 flex gap-2">
                                            <span>Formula:</span>
                                            <span>
                                                {side === 'LONG'
                                                    ? `(${exitPrice} - ${entryPrice}) × ${exitQuantity || quantity}`
                                                    : `(${entryPrice} - ${exitPrice}) × ${exitQuantity || quantity}`}
                                            </span>
                                        </div>
                                    )}
                                    {exitQuantity > 0 && exitPrice > 0 && (
                                        <div className={`mt-4 pt-4 border-t ${exitQuantityPnL >= 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-rose-200 dark:border-rose-800'}`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className={`text-xs font-bold uppercase ${exitQuantityPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>PnL for {exitQuantityPercent.toFixed(0)}% Exit</span>
                                                    <div className={`text-xl font-mono font-bold mt-1 ${exitQuantityPnL >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                                        {exitQuantityPnL >= 0 ? '+' : ''}{exitQuantityPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-bold ${exitQuantityPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {exitQuantityPercent.toFixed(0)}% of position
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Remarks / Trade Notes</label>
                                    <textarea name="remarks" rows={4} className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" placeholder="Describe your logic, emotions, or mistakes..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Chart Images</label>

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <div
                                                        className="aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-shadow"
                                                        onClick={() => setSelectedImageIndex(index)}
                                                    >
                                                        <img
                                                            src={preview.preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {preview.progress > 0 && preview.progress < 100 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                <div className="text-white text-sm font-bold">
                                                                    {preview.progress}%
                                                                </div>
                                                            </div>
                                                        )}
                                                        {preview.progress === 100 && (
                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="text-white text-sm font-bold">
                                                                    Click to view
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeImage(index);
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {preview.file.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Area */}
                                    <div
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer group"
                                    >
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-blue-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                                <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                    {imagePreviews.length > 0 ? `${imagePreviews.length} images selected (max 3)` : 'Upload images (max 3)'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB each</p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        multiple
                                        name="images"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />

                                    {/* Upload Progress */}
                                    {isUploading && (
                                        <div className="mt-4 space-y-2">
                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Uploading Images...
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: '0%' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={close}
                            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-8 py-2.5 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Logging...
                                </span>
                            ) : 'Finalize & Log Trade'}
                        </button>
                    </div>
                    {state?.error && <p className="mt-2 text-center text-rose-500 text-sm font-medium bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">{state.error}</p>}
                </form>
            </div>

            {/* Image Viewer Modal */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative max-w-4xl max-h-[90vh] w-full">
                        <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {imagePreviews[selectedImageIndex].file.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {(imagePreviews[selectedImageIndex].file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedImageIndex(null)}
                                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="relative">
                                <img
                                    src={imagePreviews[selectedImageIndex].preview}
                                    alt={imagePreviews[selectedImageIndex].file.name}
                                    className="w-full max-h-[70vh] object-contain"
                                />
                                {/* Navigation arrows */}
                                {imagePreviews.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : imagePreviews.length - 1)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setSelectedImageIndex(selectedImageIndex < imagePreviews.length - 1 ? selectedImageIndex + 1 : 0)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                    <span>{selectedImageIndex + 1} of {imagePreviews.length}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => removeImage(selectedImageIndex)}
                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Symbol Selector Modal */}
            {showSymbolSelector && (
                <SymbolSelector
                    isFutures={true}
                    onSelect={handleSymbolSelect}
                    onClose={() => setShowSymbolSelector(false)}
                />
            )}
        </div>
    );
}
