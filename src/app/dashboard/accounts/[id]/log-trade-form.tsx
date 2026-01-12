'use client';

import { useActionState, useState, useEffect } from 'react';
import { createTrade } from '@/app/lib/actions';

// We need to wrap the action to pass accountId
// or use bind on the server action.

export default function LogTradeForm({ accountId, close }: { accountId: string, close: () => void }) {
    const createTradeWithId = createTrade.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createTradeWithId, null);

    const [tradeType, setTradeType] = useState<'SPOT' | 'FUTURES'>('SPOT');

    useEffect(() => {
        if (state?.success) {
            close();
        }
    }, [state, close]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Log New Trade</h2>
                    <button onClick={close} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <form action={formAction} className="space-y-4">

                    {/* Trade Type Selection */}
                    <div className="flex rounded-md bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => setTradeType('SPOT')}
                            className={`flex-1 rounded py-1 text-sm font-medium transition-colors ${tradeType === 'SPOT' ? 'bg-white shadow' : 'text-gray-500'}`}
                        >
                            Spot
                        </button>
                        <button
                            type="button"
                            onClick={() => setTradeType('FUTURES')}
                            className={`flex-1 rounded py-1 text-sm font-medium transition-colors ${tradeType === 'FUTURES' ? 'bg-white shadow' : 'text-gray-500'}`}
                        >
                            Futures
                        </button>
                        <input type="hidden" name="type" value={tradeType} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Symbol</label>
                            <input type="text" name="symbol" required placeholder="BTCUSDT" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Side</label>
                            <select name="side" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500">
                                <option value="LONG">Long</option>
                                <option value="SHORT">Short</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Entry Price</label>
                            <input type="number" name="entryPrice" step="any" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity (Size)</label>
                            <input type="number" name="quantity" step="any" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
                        </div>
                    </div>

                    {/* Futures Specific */}
                    {tradeType === 'FUTURES' && (
                        <div className="rounded-md bg-purple-50 p-4 border border-purple-100 space-y-4">
                            <h3 className="text-sm font-semibold text-purple-900">Futures Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Leverage (x)</label>
                                    <input type="number" name="leverage" min="1" max="125" defaultValue="1" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Margin Mode</label>
                                    <select name="marginMode" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-purple-500">
                                        <option value="ISOLATED">Isolated</option>
                                        <option value="CROSS">Cross</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isPending ? 'Logging...' : 'Log Trade'}
                        </button>
                    </div>
                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                </form>
            </div>
        </div>
    );
}
