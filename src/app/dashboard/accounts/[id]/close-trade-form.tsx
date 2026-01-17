'use client';

import { useState, useEffect } from 'react';
import { closeTrade, getTradeConditions } from '@/app/lib/actions';
import { X } from 'lucide-react';

export default function CloseTradeForm({
    tradeId,
    accountId,
    symbol,
    side,
    quantity,
    onClose
}: {
    tradeId: string,
    accountId: string,
    symbol: string,
    side: string,
    quantity: number,
    onClose: () => void
}) {
    const [error, setError] = useState('');
    const [exitConditions, setExitConditions] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchConditions = async () => {
            const exit = await getTradeConditions('EXIT');
            setExitConditions(exit);
        };
        fetchConditions();
    }, []);

    async function handleSubmit(formData: FormData) {
        const result = await closeTrade(tradeId, accountId, null, formData);
        if (result?.error) {
            setError(result.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Close {side} {symbol}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Specify exit details to realize PnL.</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Price</label>
                            <input
                                name="exitPrice"
                                type="number"
                                step="any"
                                required
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Quantity</label>
                            <input
                                name="exitQuantity"
                                type="number"
                                step="any"
                                required
                                defaultValue={quantity}
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Date / Time</label>
                        <input
                            type="datetime-local"
                            name="exitDate"
                            defaultValue={new Date().toISOString().slice(0, 16)}
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Exit Condition</label>
                        <input
                            list="exit-conditions-modal"
                            name="exitCondition"
                            placeholder="Select or type..."
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white p-2.5 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <datalist id="exit-conditions-modal">
                            {exitConditions.map(c => <option key={c.id} value={c.name} />)}
                            {!exitConditions.some(c => c.name === 'Target Hit') && <option value="Target Hit" />}
                            {!exitConditions.some(c => c.name === 'Stop Loss Hit') && <option value="Stop Loss Hit" />}
                            {!exitConditions.some(c => c.name === 'Manual Exit') && <option value="Manual Exit" />}
                            {!exitConditions.some(c => c.name === 'Trailing Stop') && <option value="Trailing Stop" />}
                        </datalist>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-rose-50 dark:bg-rose-900/10 p-3 text-sm text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            Close Trade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
