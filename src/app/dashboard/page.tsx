import { auth, signOut } from '@/auth';
import { fetchUserAccounts } from '@/app/lib/data';
import AddAccountButton from './add-account-button';
import { redirect } from 'next/navigation';


export default async function Page() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const accounts = await fetchUserAccounts();

    // Calculate total portfolio value
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalEquity = accounts.reduce((sum, acc) => sum + acc.equity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Trading Journal
                                </h1>
                                <p className="text-xs text-slate-500">Track. Analyze. Improve.</p>
                            </div>
                        </div>

                        {/* User Section */}
                        <div className="flex items-center gap-4">
                            {/* User Info */}
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                    {session?.user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-900">{session?.user?.email?.split('@')[0]}</p>
                                    <p className="text-xs text-slate-500">{session?.user?.email}</p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/login' });
                                }}
                            >
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Log Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Portfolio Overview */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Overview</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                            <p className="text-3xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(totalBalance)}
                            </p>
                            <p className="text-blue-100 text-xs mt-2">{accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-400 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                            <p className="text-indigo-100 text-sm font-medium mb-1">Total Equity</p>
                            <p className="text-3xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }).format(totalEquity)}
                            </p>
                            <p className="text-indigo-100 text-xs mt-2">
                                {totalEquity >= totalBalance ? '+' : ''}{((totalEquity - totalBalance) / totalBalance * 100).toFixed(2)}% P&L
                            </p>
                        </div>
                    </div>
                </div>

                {/* Accounts Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Your Accounts</h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => (
                            <a
                                href={`/dashboard/accounts/${account.id}`}
                                key={account.id}
                                className="group block"
                            >
                                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {account.name}
                                            </h3>
                                            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${account.type === 'PERSONAL'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : account.type === 'PROP'
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                    : 'bg-slate-50 text-slate-700 border border-slate-200'
                                                }`}>
                                                {account.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: account.currency,
                                                }).format(account.currentBalance)}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">Current Balance</p>
                                        </div>
                                        <div className="pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">Equity</span>
                                                <span className="font-semibold text-slate-900">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: account.currency,
                                                    }).format(account.equity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}

                        <AddAccountButton />
                    </div>
                </div>
            </main>
        </div>
    );
}
