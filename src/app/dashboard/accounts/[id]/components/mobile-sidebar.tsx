'use client';

import React from 'react';
import { X } from 'lucide-react';
import { ViewType, menuItems } from './glass-sidebar';

interface MobileSidebarProps {
    accountId: string;
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileSidebar({ accountId, currentView, onViewChange, isOpen, onClose }: MobileSidebarProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto glass-sidebar bg-background/95 border-r border-white/10">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Dashboard</h3>
                                <p className="text-xs text-muted-foreground">Quick Navigation</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <nav className="p-6 space-y-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onViewChange(item.id);
                                    onClose();
                                }}
                                className={`
                                    menu-item w-full p-4 rounded-xl border text-left transition-all duration-300
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-white/20 text-foreground'
                                        : 'glass-card hover:bg-white/10 border-white/10 text-muted-foreground'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        h-10 w-10 rounded-lg flex items-center justify-center
                                        ${isActive ? item.gradient : 'bg-muted/50'}
                                    `}>
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.label}</p>
                                    </div>
                                    {isActive && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
