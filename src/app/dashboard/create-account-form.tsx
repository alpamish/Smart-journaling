'use client';

import { useActionState, useState } from 'react';
import { createAccount } from '@/app/lib/actions';

export default function CreateAccountForm({ close }: { close: () => void }) {
    const [errorMessage, formAction] = useActionState(createAccount, undefined);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-slate-900/20 border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-700 to-indigo-500 px-6 py-8 text-white">
                    <button
                        onClick={close}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-2xl font-bold">New Account</h2>
                    <p className="text-blue-100 text-sm mt-1">Configure your trading account details</p>
                </div>

                {/* Form */}
                <form action={formAction} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">Account Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:text-slate-400 text-slate-500"
                            placeholder="e.g. Main Futures Account"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="type" className="text-sm font-semibold text-slate-700 ml-1">Account Type</label>
                            <div className="relative">
                                <select
                                    name="type"
                                    id="type"
                                    className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer text-slate-500"
                                >
                                    <option value="PERSONAL">Personal</option>
                                    <option value="PROP">Prop Firm</option>
                                    <option value="DEMO">Demo</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="currency" className="text-sm font-semibold text-slate-700 ml-1">Currency</label>
                            <div className="relative">
                                <select
                                    name="currency"
                                    id="currency"
                                    className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 text-slate-500 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="JPY">JPY (¥)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="initialBalance" className="text-sm font-semibold text-slate-700 ml-1">Initial Balance</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 italic">
                                amt
                            </div>
                            <input
                                type="number"
                                name="initialBalance"
                                id="initialBalance"
                                required
                                step="0.01"
                                className="block w-full rounded-xl border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-2 text-slate-500 focus:ring-blue-500/10 outline-none placeholder:text-slate-400"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            className="w-full rounded-xl cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-400 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98]"
                        >
                            Create Account
                        </button>
                        <button
                            type="button"
                            onClick={close}
                            className="w-full rounded-xl py-3 text-sm font-semibold text-slate-600 cursor-pointer"
                        >
                            Nevermind, cancel
                        </button>
                    </div>
                    {errorMessage && (
                        <div className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
