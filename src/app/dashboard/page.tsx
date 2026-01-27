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
    const totalPnL = totalEquity - totalBalance;
    const pnlPercentage = totalBalance > 0 ? (totalPnL / totalBalance) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-2xl sticky top-0 z-50 shadow-2xl shadow-black/20">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                                    Trading Journal
                                </h1>
                                <p className="text-xs text-slate-400 font-medium tracking-wide">Professional Portfolio Management</p>
                            </div>
                        </div>

                        {/* User Section */}
                        <div className="flex items-center gap-4">
                            {/* User Info */}
                            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                                    {session?.user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white">{session?.user?.email?.split('@')[0]}</p>
                                    <p className="text-xs text-slate-400">{session?.user?.email}</p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/login' });
                                }}
                            >
                                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 cursor-pointer group">
                                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                {/* Welcome Section */}
                <div className="mb-10 animate-fade-in">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{session?.user?.email?.split('@')[0]}</span>
                    </h2>
                    <p className="text-slate-400">Here's your portfolio performance overview</p>
                </div>

                {/* Portfolio Overview */}
                <div className="mb-12 animate-slide-up">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Total Balance Card */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-2xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/50">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-blue-200 text-sm font-semibold tracking-wide uppercase">Total Balance</p>
                                            <p className="text-xs text-blue-300/70">{accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}</p>
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold text-white mb-1">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                        }).format(totalBalance)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Equity Card */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-purple-200 text-sm font-semibold tracking-wide uppercase">Total Equity</p>
                                            <p className="text-xs text-purple-300/70">Current Value</p>
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold text-white mb-1">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                        }).format(totalEquity)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* P&L Card */}
                        <div className="relative group">
                            <div className={`absolute inset-0 ${totalPnL >= 0 ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-red-500 to-rose-500'} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                            <div className={`relative ${totalPnL >= 0 ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'} backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden`}>
                                {/* Decorative Elements */}
                                <div className={`absolute top-0 right-0 w-32 h-32 ${totalPnL >= 0 ? 'bg-emerald-400/20' : 'bg-red-400/20'} rounded-full blur-3xl`}></div>
                                <div className={`absolute bottom-0 left-0 w-24 h-24 ${totalPnL >= 0 ? 'bg-green-400/20' : 'bg-rose-400/20'} rounded-full blur-2xl`}></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-2xl ${totalPnL >= 0 ? 'bg-gradient-to-br from-emerald-400 to-green-400 shadow-emerald-500/50' : 'bg-gradient-to-br from-red-400 to-rose-400 shadow-red-500/50'} flex items-center justify-center shadow-lg`}>
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {totalPnL >= 0 ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                                )}
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={`${totalPnL >= 0 ? 'text-emerald-200' : 'text-red-200'} text-sm font-semibold tracking-wide uppercase`}>Profit & Loss</p>
                                            <p className={`text-xs ${totalPnL >= 0 ? 'text-emerald-300/70' : 'text-red-300/70'}`}>Overall Performance</p>
                                        </div>
                                    </div>
                                    <p className="text-4xl font-bold text-white mb-1">
                                        {totalPnL >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 2,
                                        }).format(totalPnL)}
                                    </p>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${totalPnL >= 0 ? 'bg-emerald-500/30' : 'bg-red-500/30'} border ${totalPnL >= 0 ? 'border-emerald-400/30' : 'border-red-400/30'}`}>
                                        <span className="text-sm font-bold text-white">
                                            {totalPnL >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounts Section */}
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Your Accounts</h2>
                            <p className="text-sm text-slate-400">Manage and monitor your trading accounts</p>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account, index) => {
                            const accountPnL = account.equity - account.currentBalance;
                            const accountPnLPercentage = account.currentBalance > 0 ? (accountPnL / account.currentBalance) * 100 : 0;

                            return (
                                <a
                                    href={`/dashboard/accounts/${account.id}`}
                                    key={account.id}
                                    className="group block animate-scale-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="relative h-full">
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        {/* Card */}
                                        <div className="relative h-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 overflow-hidden">
                                            {/* Decorative Corner */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                                            <div className="relative z-10">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                                                            {account.name}
                                                        </h3>
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${account.type === 'PERSONAL'
                                                                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                                                                : account.type === 'PROP'
                                                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                                                    : 'bg-slate-500/20 text-slate-300 border border-slate-400/30'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${account.type === 'PERSONAL' ? 'bg-blue-400' : account.type === 'PROP' ? 'bg-purple-400' : 'bg-slate-400'
                                                                }`}></div>
                                                            {account.type}
                                                        </span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Balance */}
                                                <div className="mb-4">
                                                    <p className="text-sm text-slate-400 mb-1 font-medium">Current Balance</p>
                                                    <p className="text-3xl font-bold text-white">
                                                        {new Intl.NumberFormat('en-US', {
                                                            style: 'currency',
                                                            currency: account.currency,
                                                        }).format(account.currentBalance)}
                                                    </p>
                                                </div>

                                                {/* Stats */}
                                                <div className="pt-4 border-t border-white/10 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-400">Equity</span>
                                                        <span className="text-sm font-bold text-white">
                                                            {new Intl.NumberFormat('en-US', {
                                                                style: 'currency',
                                                                currency: account.currency,
                                                            }).format(account.equity)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-400">P&L</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-bold ${accountPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                {accountPnL >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', {
                                                                    style: 'currency',
                                                                    currency: account.currency,
                                                                }).format(accountPnL)}
                                                            </span>
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${accountPnL >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                                                {accountPnL >= 0 ? '+' : ''}{accountPnLPercentage.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            );
                        })}

                        <AddAccountButton />
                    </div>
                </div>
            </main>
        </div>
    );
}
