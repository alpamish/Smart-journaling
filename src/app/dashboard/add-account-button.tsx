'use client';

import { useState } from 'react';
import CreateAccountForm from './create-account-form';

export default function AddAccountButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group flex min-h-[200px] w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/50 hover:bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300"
            >
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Add New Account</span>
                </div>
            </button>
            {isOpen && <CreateAccountForm close={() => setIsOpen(false)} />}
        </>
    );
}
