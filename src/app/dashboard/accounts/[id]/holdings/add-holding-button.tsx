'use client';

import { useState } from 'react';
import AddHoldingForm from './add-holding-form';

export default function AddHoldingButton({ accountId }: { accountId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
                + Add Asset
            </button>
            {isOpen && <AddHoldingForm accountId={accountId} close={() => setIsOpen(false)} />}
        </>
    );
}
