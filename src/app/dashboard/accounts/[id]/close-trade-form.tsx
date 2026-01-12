'use client';

import { useState } from 'react';
import { closeTrade } from '@/app/lib/actions';
import { X } from 'lucide-react';

export default function CloseTradeForm({
    tradeId,
    accountId,
    symbol,
    side,
    onClose
}: {
    tradeId: string,
    accountId: string,
    symbol: string,
    side: string,
    onClose: () => void
}) {
    const [error, setError] = useState('');

    async function handleSubmit(formData: FormData) {
        const result = await closeTrade(tradeId, accountId, null, formData);
        if (result?.error) {
            setError(result.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Close {side} {symbol}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Exit Price</label>
                        <input
                            name="exitPrice"
                            type="number"
                            step="any"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                            Close Trade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
