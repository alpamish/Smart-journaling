'use client';

import { useActionState, useState, useEffect } from 'react';
import { createSpotHolding } from '@/app/lib/actions';

export default function AddHoldingForm({ accountId, close }: { accountId: string, close: () => void }) {
    const createHoldingWithId = createSpotHolding.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createHoldingWithId, null);

    useEffect(() => {
        if (state?.success) {
            close();
        }
    }, [state, close]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Add Spot Holding</h2>
                    <button onClick={close} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <form action={formAction} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asset Symbol</label>
                        <input type="text" name="assetSymbol" required placeholder="BTC" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input type="number" name="quantity" step="any" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Avg Buy Price</label>
                            <input type="number" name="avgEntryPrice" step="any" required className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea name="notes" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500" />
                    </div>

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
                            {isPending ? 'Adding...' : 'Add Holding'}
                        </button>
                    </div>
                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                </form>
            </div>
        </div>
    );
}
