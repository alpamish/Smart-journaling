'use client';

import { useState } from 'react';
import { Trade, Image as TradeImage } from '@prisma/client';
import TradeDetailModal from './trade-detail-modal';
import { Info } from 'lucide-react';

interface TradeWithImages extends Trade {
    images: TradeImage[];
}

export default function TradeDetailButton({ trade }: { trade: TradeWithImages }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 active:scale-95"
                title="View Trade Details"
            >
                <Info size={14} />
                Detail
            </button>

            {isOpen && (
                <TradeDetailModal trade={trade} onClose={() => setIsOpen(false)} />
            )}
        </>
    );
}
