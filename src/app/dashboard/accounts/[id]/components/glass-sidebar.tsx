'use client';

import React, { useState } from 'react';
import {
    LayoutGrid,
    Wallet,
    BookOpen,
    TrendingUp,
    DollarSign,
    Target,
    Activity,
    ChevronLeft,
    ChevronRight,
    Home
} from 'lucide-react';
import Link from 'next/link';

export type ViewType = 'grid' | 'holdings' | 'journal' | 'analytics';

export interface MenuItem {
    id: ViewType;
    label: string;
    icon: React.ElementType;
    description: string;
    gradient: string;
}

export const menuItems: MenuItem[] = [
    {
        id: 'grid',
        label: 'Grid Strategy',
        icon: LayoutGrid,
        description: 'Automated trading grids',
        gradient: 'gradient-info'
    },
    {
        id: 'holdings',
        label: 'Spot Holdings',
        icon: Wallet,
        description: 'Current positions',
        gradient: 'gradient-purple'
    },
    {
        id: 'journal',
        label: 'Trade Journal',
        icon: BookOpen,
        description: 'Complete trade history',
        gradient: 'gradient-success'
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: Activity,
        description: 'Performance metrics',
        gradient: 'gradient-orange'
    }
];

interface GlassSidebarProps {
    accountId: string;
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    className?: string;
    stats?: {
        winRate?: string;
        totalPnL?: string;
        monthlyReturn?: string;
    };
}

export default function GlassSidebar({
    accountId,
    currentView,
    onViewChange,
    className = '',
    stats = {
        winRate: '0%',
        totalPnL: '$0.00',
        monthlyReturn: '0%'
    }
}: GlassSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`
            relative glass-sidebar transition-all duration-500 ease-in-out
            ${isCollapsed ? 'w-20' : 'w-80'}
            ${className}
        `}>

            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Dashboard</h3>
                                    <p className="text-xs text-muted-foreground">Quick Navigation</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            ) : (
                                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                        </button>
                    </div>

                    {!isCollapsed && (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-white/10 glass-card hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                                <Home className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Exit Account</span>
                        </Link>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`
                                    menu-item w-full p-2 rounded-xl border text-left
                                    ${isActive ? 'active border-white/20' : 'glass-card hover:bg-white/10'}
                                    transition-all duration-300
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        h-10 w-10 rounded-lg flex items-center justify-center
                                        ${isActive ? item.gradient : 'bg-muted/50'}
                                        transition-all duration-300
                                    `}>
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {item.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 truncate">
                                                {item.description}
                                            </p>
                                        </div>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {!isCollapsed && (
                    <div className="p-4 border-t border-white/10">
                        <div className="glass-card rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                                <Target className="h-3 w-3" />
                                <span>Performance</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Win Rate</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-semibold text-foreground">{stats.winRate}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Total P&L</p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-blue-500" />
                                        <span className={`text-sm font-semibold ${Number(stats.totalPnL?.replace(/[^0-9.-]+/g, "")) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {stats.totalPnL}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-badge rounded-lg p-3 mt-3 overflow-hidden group">
                                <div className="stat-glow" />
                                <div className="relative flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Monthly Return</span>
                                    <span className={`text-sm font-semibold flex items-center gap-1 ${Number(stats.monthlyReturn?.replace(/[^0-9.-]+/g, "")) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        <Activity className={`h-3 w-3 ${Number(stats.monthlyReturn?.replace(/[^0-9.-]+/g, "")) < 0 ? 'rotate-180' : ''}`} />
                                        {stats.monthlyReturn}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
