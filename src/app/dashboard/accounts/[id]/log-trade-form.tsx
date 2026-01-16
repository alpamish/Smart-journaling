'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
import { createTrade, getTradeConditions } from '@/app/lib/actions';
import { TradeCondition } from '@prisma/client';

export default function LogTradeForm({ accountId, close }: { accountId: string, close: () => void }) {
    const createTradeWithId = createTrade.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createTradeWithId, null);

    // Form State for dynamic logic
    const [segment, setSegment] = useState('CRYPTO');
    const [quantity, setQuantity] = useState<number>(0);
    const [entryPrice, setEntryPrice] = useState<number>(0);
    const [leverage, setLeverage] = useState<number>(1);
    const [exitPrice, setExitPrice] = useState<number>(0);
    const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

    // Conditions State
    const [entryConditions, setEntryConditions] = useState<TradeCondition[]>([]);
    const [exitConditions, setExitConditions] = useState<TradeCondition[]>([]);
    const [imageCount, setImageCount] = useState(0);
    const [customEntry, setCustomEntry] = useState('');
    const [customExit, setCustomExit] = useState('');

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
        }
    }, [state, close]);

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

                <form action={formAction} className="space-y-8">
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
                                    <input type="text" name="symbol" required placeholder="e.g. BTCUSDT" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Side</label>
                                    <select
                                        name="side"
                                        value={side}
                                        onChange={(e) => setSide(e.target.value as any)}
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
                                    <select name="analysisTimeframe" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all">
                                        {['1m', '5m', '15m', '1h', '4h', '1d', '1w'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Entry Timeframe</label>
                                    <select name="entryTimeframe" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all">
                                        {['1m', '5m', '15m', '1h', '4h', '1d', '1w'].map(tf => <option key={tf} value={tf}>{tf}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Entry Condition</label>
                            <div className="relative">
                                <input
                                    list="entry-conditions"
                                    name="entryCondition"
                                    placeholder="Select or type new condition..."
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <datalist id="entry-conditions">
                                    {entryConditions.map(c => <option key={c.id} value={c.name} />)}
                                    {['Accurate Entry', 'Early Entry', 'FOMO', 'Trendline Breakout'].map(ex => <option key={ex} value={ex} />)}
                                </datalist>
                            </div>
                        </div>
                    </section>

                    {/* Risk & Position Management */}
                    <section>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">3. Risk & Position</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Stop Loss</label>
                                <input type="number" name="stopLoss" step="any" className="w-full rounded-lg border-rose-100 dark:border-rose-900/30 dark:bg-rose-900/10 text-rose-600 p-2.5 focus:ring-2 focus:ring-rose-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target (TP)</label>
                                <input type="number" name="takeProfit" step="any" className="w-full rounded-lg border-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/10 text-emerald-600 p-2.5 focus:ring-2 focus:ring-emerald-500 transition-all" />
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
                                    defaultValue="1"
                                    onChange={(e) => setLeverage(parseFloat(e.target.value) || 1)}
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
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase">Margin Required</span>
                                <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                                    {marginUsed.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-blue-400">USD</span>
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
                                <input type="number" name="exitQuantity" step="any" className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Condition</label>
                                <input
                                    list="exit-conditions"
                                    name="exitCondition"
                                    placeholder="Select or type..."
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <datalist id="exit-conditions">
                                    {exitConditions.map(c => <option key={c.id} value={c.name} />)}
                                    {['Target Hit', 'Stop Loss Hit', 'Manual Exit', 'Trailing Stop'].map(ex => <option key={ex} value={ex} />)}
                                </datalist>
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
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Remarks / Trade Notes</label>
                                    <textarea name="remarks" rows={4} className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400" placeholder="Describe your logic, emotions, or mistakes..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Chart Images</label>
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
                                                    {imageCount > 0 ? `${imageCount} images selected` : 'Upload multiple images'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        multiple
                                        name="images"
                                        className="hidden"
                                        onChange={(e) => setImageCount(e.target.files?.length || 0)}
                                    />
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
        </div>
    );
}
