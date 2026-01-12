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
        <div className="space-y-4">
            {strategies.map((grid) => (
                <div key={grid.id} className="rounded-lg border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{grid.symbol}</h3>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border uppercase">{grid.type}</span>
                                {grid.type === 'FUTURES' && grid.direction && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${grid.direction === 'LONG' ? 'bg-green-100 text-green-700 border-green-200' :
                                            grid.direction === 'SHORT' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}>
                                        {grid.direction}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Range: {grid.lowerPrice} - {grid.upperPrice} | Grids: {grid.gridCount}
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                <div><span className="text-gray-400">Entry:</span> ${grid.entryPrice || '-'}</div>
                                {grid.type === 'FUTURES' && (
                                    <div><span className="text-gray-400">Liq. Price:</span> ${grid.liquidationPrice || '-'}</div>
                                )}
                                <div><span className="text-gray-400">Investment:</span> ${grid.allocatedCapital}</div>
                                {grid.type === 'FUTURES' && grid.leverage && (
                                    <div><span className="text-gray-400">Lev:</span> {grid.leverage}x</div>
                                )}
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <div className={`text-sm font-bold px-2 py-0.5 rounded-full ${grid.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                    grid.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {grid.status}
                            </div>
                            <p className="text-xs text-gray-400">
                                {new Date(grid.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-2 flex gap-3">
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

                    <div className="mt-4 border-t pt-4 flex justify-between items-end text-sm">
                        <div className="space-y-1">
                            <div>Grid P&L: <span className={grid.realizedPnL >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>${grid.realizedPnL}</span></div>
                            {grid.status === 'CLOSED' && (
                                <>
                                    <div>Exit Price: <span className="font-medium">${grid.exitPrice || '-'}</span></div>
                                    <div>Total P&L: <span className={(grid.totalProfit || 0) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>${grid.totalProfit || '0'}</span></div>
                                </>
                            )}
                        </div>
                        <a href={`/dashboard/accounts/${accountId}/grid/${grid.id}`} className="text-blue-600 hover:underline">View Details</a>
                    </div>
                </div>
            ))}
        </div>
    );
}
