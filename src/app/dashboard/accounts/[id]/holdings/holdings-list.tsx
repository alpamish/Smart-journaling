import { fetchSpotHoldings } from '@/app/lib/data';
import DeleteButton from '@/app/dashboard/components/delete-button';
import { deleteSpotHolding } from '@/app/lib/actions';

export default async function HoldingsList({ accountId }: { accountId: string }) {
    const holdings = await fetchSpotHoldings(accountId);

    if (holdings.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-500 shadow-sm">
                No spot holdings tracked. Add assets to your portfolio.
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Avg Buy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Value (Est)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Notes</th>
                        <th className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {holdings.map((holding) => (
                        <tr key={holding.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                                {holding.assetSymbol}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                {holding.quantity}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                ${holding.avgEntryPrice}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                ${(holding.quantity * holding.avgEntryPrice).toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 italic">
                                {holding.notes || '-'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <DeleteButton
                                    onDelete={deleteSpotHolding.bind(null, holding.id, accountId)}
                                    itemType="Asset"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
