'use client';

import { useState } from 'react';
import CreateAccountForm from './create-account-form';

export default function AddAccountButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative h-full min-h-[280px] w-full rounded-2xl border-2 border-dashed border-white/20 bg-slate-800/30 backdrop-blur-xl hover:bg-slate-800/50 hover:border-blue-400/50 transition-all duration-500 overflow-hidden"
            >
                {/* Animated Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-400/50 transition-all duration-300">
                            <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-base font-semibold text-slate-300 group-hover:text-white transition-colors mb-1">Add New Account</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Create a new trading account</span>
                </div>
            </button>
            {isOpen && <CreateAccountForm close={() => setIsOpen(false)} />}
        </>
    );
}
