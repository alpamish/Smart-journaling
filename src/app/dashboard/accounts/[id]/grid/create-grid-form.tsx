'use client';

import { useActionState, useState, useEffect } from 'react';
import { createGridStrategy } from '@/app/lib/actions';

export default function CreateGridForm({ accountId, close }: { accountId: string, close: () => void }) {
    const createGridWithId = createGridStrategy.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createGridWithId, null);

    const [gridType, setGridType] = useState<'SPOT' | 'FUTURES'>('SPOT');
    const [lowerPrice, setLowerPrice] = useState<string>('');
    const [upperPrice, setUpperPrice] = useState<string>('');

    const isPriceInvalid = lowerPrice !== '' && upperPrice !== '' && parseFloat(lowerPrice) >= parseFloat(upperPrice);

    useEffect(() => {
        if (state?.success) {
            close();
        }
    }, [state, close]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 via-gray-900/60 to-black/70 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-white via-gray-50 to-white p-10 shadow-2xl ring-2 ring-white/20 border border-white/10 transform transition-all duration-500 hover:scale-[1.01] max-h-[90vh] overflow-y-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Create <span className="text-blue-600">Grid Strategy</span>
                        </h2>
                    </div>
                    <button
                        onClick={close}
                        className="text-gray-400 hover:text-gray-600 transition-all duration-200 transform hover:scale-110 p-2 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes blink-red {
                        0%, 100% { border-color: #e5e7eb; }
                        50% { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15); }
                    }
                    .animate-blink-red {
                        animation: blink-red 0.8s infinite;
                        border-width: 2px !important;
                    }
                `}} />

                <form action={formAction} className="space-y-6 text-left text-slate-500">
                    {/* Strategy Type Toggle */}
                    <div className="flex rounded-xl bg-gray-100/80 p-1.5 ring-1 ring-gray-200">
                        <button
                            type="button"
                            onClick={() => setGridType('SPOT')}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${gridType === 'SPOT' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m.599-1c.538-.1 1.054-.236 1.536-.407M12 16c-1.11 0-2.08-.402-2.599-1M12 16v1m0-1V7m3.377 4.794c.045-.29.073-.585.083-.884 0-.351-.018-.696-.051-1.033m-1.282-1.391a9.043 9.043 0 00-2.122-1.573M9.141 6.14a9.04 9.04 0 00-2.122 1.573m-.052 1.033A9.043 9.043 0 006 12c0 .324.017.643.05 1.033" />
                            </svg>
                            Spot Grid
                        </button>
                        <button
                            type="button"
                            onClick={() => setGridType('FUTURES')}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 ${gridType === 'FUTURES' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Futures Grid
                        </button>
                        <input type="hidden" name="type" value={gridType} />
                    </div>

                    {/* Symbol Input */}
                    <div className="group">
                        <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">Symbol</label>
                        <input
                            type="text"
                            name="symbol"
                            required
                            placeholder="e.g., BTCUSDT"
                            className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 placeholder-gray-400 font-medium uppercase"
                        />
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">Lower Price</label>
                            <input
                                type="number"
                                name="lowerPrice"
                                step="any"
                                required
                                value={lowerPrice}
                                onChange={(e) => setLowerPrice(e.target.value)}
                                className={`mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 ${isPriceInvalid ? 'animate-blink-red' : ''}`}
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">Upper Price</label>
                            <input
                                type="number"
                                name="upperPrice"
                                step="any"
                                required
                                value={upperPrice}
                                onChange={(e) => setUpperPrice(e.target.value)}
                                className={`mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 ${isPriceInvalid ? 'animate-blink-red' : ''}`}
                            />
                        </div>
                    </div>
                    {isPriceInvalid && (
                        <div className="flex items-center gap-2 text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg animate-in slide-in-from-top-2 duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Lower price must be less than upper price
                        </div>
                    )}

                    {/* Grid Details */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">Grid Count</label>
                            <input type="number" name="gridCount" min="2" max="300" required className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50" />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">Investment</label>
                            <div className="relative">
                                <input type="number" name="allocatedCapital" step="any" required className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50" />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-gray-400 text-sm font-bold">$</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">Entry Price</label>
                            <input type="number" name="entryPrice" step="any" required className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50" />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">Creation Date</label>
                            <input type="date" name="createdAt" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-3 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50" />
                        </div>
                    </div>

                    {/* Futures Settings */}
                    {gridType === 'FUTURES' && (
                        <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/30 to-purple-50 p-6 border-2 border-purple-100/50 space-y-6 shadow-inner animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-purple-900">Futures Settings</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-bold text-purple-800 mb-2">Position</label>
                                    <select name="direction" className="mt-1 block w-full rounded-xl border-2 border-purple-200 px-4 py-2.5 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white font-medium">
                                        <option value="LONG">Long</option>
                                        <option value="SHORT">Short</option>
                                        <option value="NEUTRAL">Neutral</option>
                                    </select>
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-bold text-purple-800 mb-2">Leverage (x)</label>
                                    <input type="number" name="leverage" min="1" max="125" defaultValue="1" className="mt-1 block w-full rounded-xl border-2 border-purple-200 px-4 py-2.5 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white font-medium" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-bold text-purple-800 mb-2">Est. Liq. Price</label>
                                    <input type="number" name="liquidationPrice" step="any" className="mt-1 block w-full rounded-xl border-2 border-purple-200 px-4 py-2.5 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white" />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-bold text-purple-800 mb-2">Inv. After Leverage</label>
                                    <input type="number" name="investmentAfterLeverage" step="any" className="mt-1 block w-full rounded-xl border-2 border-purple-200 px-4 py-2.5 shadow-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-xl border-2 border-gray-200 px-8 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || isPriceInvalid}
                            className={`rounded-xl px-10 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${gridType === 'FUTURES' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Strategy...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Deploy Grid
                                </>
                            )}
                        </button>
                    </div>

                    {state?.error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-bold animate-pulse">
                            {state.error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
