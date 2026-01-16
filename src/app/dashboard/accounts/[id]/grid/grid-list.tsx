import { fetchGridStrategies } from '@/app/lib/data';
import DeleteButton from '@/app/dashboard/components/delete-button';
import { deleteGridStrategy } from '@/app/lib/actions';
import CloseGridButton from './close-grid-button';

export default async function GridList({ accountId }: { accountId: string }) {
    const strategies = await fetchGridStrategies(accountId);

    if (strategies.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-500 shadow-sm">
                No active grid strategies. Create one to start automating.
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {strategies.map((grid) => (
                <div key={grid.id} className="premium-card group relative flex flex-col justify-between overflow-hidden">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <span className="text-sm font-bold">{grid.symbol}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground ring-1 ring-inset ring-border">
                                        {grid.type}
                                    </span>
                                    {grid.type === 'FUTURES' && grid.direction && (
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${grid.direction === 'LONG' ? 'bg-green-500/10 text-green-600 ring-green-600/20' :
                                            grid.direction === 'SHORT' ? 'bg-red-500/10 text-red-600 ring-red-600/20' :
                                                'bg-blue-500/10 text-blue-600 ring-blue-600/20'
                                            }`}>
                                            {grid.direction}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${grid.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 ring-green-600/20' :
                                grid.status === 'CLOSED' ? 'bg-muted text-muted-foreground ring-border' :
                                    'bg-yellow-500/10 text-yellow-600 ring-yellow-600/20'
                                }`}>
                                {grid.status}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Price Range</p>
                                <p className="text-sm font-bold text-foreground">${grid.lowerPrice} - ${grid.upperPrice}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Grids / Invested</p>
                                <p className="text-sm font-bold text-foreground">{grid.gridCount} / ${grid.allocatedCapital}</p>
                            </div>
                        </div>

                        {grid.type === 'FUTURES' && (
                            <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-3">
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Entry / Lev</p>
                                    <p className="text-xs font-semibold text-foreground">${grid.entryPrice || '-'} / {grid.leverage}x</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Liq. Price</p>
                                    <p className="text-xs font-semibold text-red-600">${grid.liquidationPrice || '-'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex items-end justify-between border-t pt-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Profit & Loss</span>
                                <div className="flex items-baseline gap-2">
                                    {/* <span className={`text-xl font-black tabular-nums ${grid.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {grid.realizedPnL >= 0 ? `+$${grid.realizedPnL}` : `-$${Math.abs(grid.realizedPnL)}`}
                                    </span> */}
                                    <span className={`text-md font-black tabular-nums ${grid.gridProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {grid.status === 'CLOSED' && (
                                            grid.gridProfit >= 0 ? `+$${grid.gridProfit}` : `-$${Math.abs(grid.gridProfit)}`
                                        )}
                                    </span>
                                    {grid.status === 'CLOSED' && (
                                        <span className={`text-xs font-bold ${(grid.totalProfit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            (Tot: ${grid.totalProfit ?? 0})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <a
                                href={`/dashboard/accounts/${accountId}/grid/${grid.id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            >
                                Details
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Created {new Date(grid.createdAt).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                                {grid.status === 'ACTIVE' && (
                                    <CloseGridButton
                                        accountId={accountId}
                                        strategyId={grid.id}
                                        symbol={grid.symbol}
                                    />
                                )}
                                <DeleteButton
                                    onDelete={deleteGridStrategy.bind(null, grid.id, accountId)}
                                    itemType="Strategy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
