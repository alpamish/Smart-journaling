'use client';

import { useState } from 'react';
import LogTradeForm from './log-trade-form';

export default function LogTradeButton({ accountId }: { accountId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                + Log Trade
            </button>
            {isOpen && <LogTradeForm accountId={accountId} close={() => setIsOpen(false)} />}
        </>
    );
}
