'use client';

import { useState } from 'react';
import CreateGridForm from './create-grid-form';

export default function CreateGridButton({ accountId }: { accountId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
                + New Strategy
            </button>
            {isOpen && <CreateGridForm accountId={accountId} close={() => setIsOpen(false)} />}
        </>
    );
}
