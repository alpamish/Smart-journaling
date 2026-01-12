'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Added auth import
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/dashboard',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function logout() {
    await signOut();
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const { email, password } = Object.fromEntries(formData);

    if (!email || !password) {
        return 'Missing email or password';
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: String(email) },
        });

        if (existingUser) {
            return 'User already exists.';
        }

        const hashedPassword = await bcrypt.hash(String(password), 10);

        await prisma.user.create({
            data: {
                email: String(email),
                password: hashedPassword,
                // Create a default Personal account
                accounts: {
                    create: {
                        name: 'Personal Account',
                        type: 'PERSONAL',
                        initialBalance: 0,
                        currency: 'USD'
                    }
                }
            },
        });

    } catch (error) {
        console.error('Registration error:', error);
        return 'Failed to register user.';
    }

    // Redirect to login after success - handled by client or redirect()
    // For simplicity using redirect here if you want, but for now just returning success state or void
    // Using direct signIn to auto-login is also an option, but let's stick to redirect

    // Actually, let's just return a success message or null if success, and handle redirect in client or here.
    // Using 'redirect' from next/navigation throws an error which is caught by catch block if inside try.
    // So we handle it specifically.

    // Redirect after success outside of try/catch to avoid catching the redirect error
    redirect('/login');
}

export async function createAccount(
    prevState: string | undefined,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) return 'Unauthorized';

    const name = formData.get('name') as string;
    const initialBalance = parseFloat(formData.get('initialBalance') as string);
    const type = formData.get('type') as 'PERSONAL' | 'PROP' | 'DEMO';
    const currency = formData.get('currency') as string; // Default USD if not present?

    if (!name || isNaN(initialBalance)) {
        return 'Invalid input';
    }

    try {
        await prisma.account.create({
            data: {
                userId: session.user.id,
                name,
                type,
                initialBalance,
                currentBalance: initialBalance,
                equity: initialBalance,
                currency: currency || 'USD',
            },
        });
    } catch (error) {
        console.error('Create Account Error:', error);
        return 'Failed to create account.';
    }


    revalidatePath('/dashboard');
    redirect('/dashboard');
}

export async function createTrade(
    accountId: string,
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const type = formData.get('type') as 'SPOT' | 'FUTURES';
    const side = formData.get('side') as 'LONG' | 'SHORT';
    const symbol = formData.get('symbol') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const entryPrice = parseFloat(formData.get('entryPrice') as string);
    const leverage = parseFloat(formData.get('leverage') as string) || 1;
    const marginMode = formData.get('marginMode') as 'ISOLATED' | 'CROSS' | null;

    if (!symbol || isNaN(quantity) || isNaN(entryPrice)) {
        return { error: 'Invalid input' };
    }

    // Basic validation for Futures
    if (type === 'FUTURES' && (!leverage || !marginMode)) {
        return { error: 'Leverage and Margin Mode required for Futures' };
    }

    try {
        // 1. Fetch Account to check balance/validate
        const account = await prisma.account.findUnique({
            where: { id: accountId, userId: session.user.id }
        });

        if (!account) return { error: 'Account not found' };

        // Calculate Margin/Cost
        let cost = 0;
        let marginUsed = 0;

        if (type === 'SPOT') {
            cost = quantity * entryPrice;
            // Check balance
            if (side === 'LONG' && cost > account.currentBalance) {
                return { error: 'Insufficient balance' };
            }
        } else {
            // Futures
            // Initial Margin = (Entry * Qty) / Leverage
            marginUsed = (quantity * entryPrice) / leverage;
            if (marginUsed > account.currentBalance) { // Simplified check (using currentBalance as free margin for now)
                return { error: 'Insufficient margin' };
            }
        }

        // 2. Create Trade
        await prisma.trade.create({
            data: {
                accountId,
                type,
                side,
                symbol: symbol.toUpperCase(),
                quantity,
                entryPrice,
                leverage: type === 'FUTURES' ? leverage : null,
                marginMode: type === 'FUTURES' ? marginMode : null,
                marginUsed: type === 'FUTURES' ? marginUsed : null,
                status: 'OPEN',
            },
        });

        // 3. Update Account Balance (Deduct cost/margin)
        // Note: strict separation. Spot deduction is permanent until sell. Futures margin is locked.
        // For MVP, simply deducting 'currentBalance' to represent 'Free Margin/Available Balance'.

        const balanceChange = type === 'SPOT' ? cost : marginUsed;

        await prisma.account.update({
            where: { id: accountId },
            data: {
                currentBalance: { decrement: balanceChange }
            }
        });

    } catch (error) {
        console.error('Create Trade Error:', error);
        return { error: 'Failed to log trade.' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}


export async function createGridStrategy(
    accountId: string,
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const type = formData.get('type') as string; // 'SPOT' | 'FUTURES'
    const symbol = formData.get('symbol') as string;
    const lowerPrice = parseFloat(formData.get('lowerPrice') as string);
    const upperPrice = parseFloat(formData.get('upperPrice') as string);
    const gridCount = parseInt(formData.get('gridCount') as string);
    const allocatedCapital = parseFloat(formData.get('allocatedCapital') as string);
    const leverage = parseFloat(formData.get('leverage') as string);
    const direction = formData.get('direction') as string || 'NEUTRAL';
    const liquidationPrice = parseFloat(formData.get('liquidationPrice') as string);
    const investmentAfterLeverage = parseFloat(formData.get('investmentAfterLeverage') as string);
    const entryPrice = parseFloat(formData.get('entryPrice') as string);

    if (!symbol || isNaN(lowerPrice) || isNaN(upperPrice) || isNaN(gridCount) || isNaN(allocatedCapital)) {
        return { error: 'Invalid input parameters' };
    }

    if (lowerPrice >= upperPrice) {
        return { error: 'Lower price must be less than upper price' };
    }

    try {
        const account = await prisma.account.findUnique({
            where: { id: accountId, userId: session.user.id }
        });

        if (!account) return { error: 'Account not found' };

        // For simplicity, we just create the strategy record. 
        // In a real app, successful creation might trigger an order placement engine.

        await prisma.gridStrategy.create({
            data: {
                accountId,
                type,
                symbol: symbol.toUpperCase(),
                lowerPrice,
                upperPrice,
                gridCount,
                allocatedCapital,
                leverage: leverage || 1, // Default 1 for spot
                direction,
                liquidationPrice: isNaN(liquidationPrice) ? null : liquidationPrice,
                investmentAfterLeverage: isNaN(investmentAfterLeverage) ? null : investmentAfterLeverage,
                entryPrice: isNaN(entryPrice) ? null : entryPrice,
                status: 'ACTIVE',
            }
        });

    } catch (error) {
        console.error('Create Grid Error:', error);
        return { error: 'Failed to create grid strategy' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}

export async function createSpotHolding(
    accountId: string,
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const assetSymbol = formData.get('assetSymbol') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const avgEntryPrice = parseFloat(formData.get('avgEntryPrice') as string);
    const notes = formData.get('notes') as string || '';

    if (!assetSymbol || isNaN(quantity) || isNaN(avgEntryPrice)) {
        return { error: 'Invalid input parameters' };
    }

    try {
        const account = await prisma.account.findUnique({
            where: { id: accountId, userId: session.user.id }
        });

        if (!account) return { error: 'Account not found' };

        await prisma.spotHolding.create({
            data: {
                accountId,
                assetSymbol: assetSymbol.toUpperCase(),
                quantity,
                avgEntryPrice,
                notes,
            }
        });

    } catch (error) {
        console.error('Create Holding Error:', error);
        return { error: 'Failed to add holding' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}

export async function deleteGridStrategy(strategyId: string, accountId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        const strategy = await prisma.gridStrategy.findUnique({
            where: { id: strategyId },
            include: { account: true }
        });

        if (!strategy || strategy.account.userId !== session.user.id) {
            return { error: 'Unauthorized' };
        }

        await prisma.gridStrategy.delete({
            where: { id: strategyId }
        });

    } catch (error) {
        console.error('Delete Grid Error:', error);
        return { error: 'Failed to delete strategy' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}

export async function deleteSpotHolding(holdingId: string, accountId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        const holding = await prisma.spotHolding.findUnique({
            where: { id: holdingId },
            include: { account: true }
        });

        if (!holding || holding.account.userId !== session.user.id) {
            return { error: 'Unauthorized' };
        }

        await prisma.spotHolding.delete({
            where: { id: holdingId }
        });

    } catch (error) {
        console.error('Delete Holding Error:', error);
        return { error: 'Failed to delete holding' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}

export async function closeTrade(
    tradeId: string,
    accountId: string,
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const exitPrice = parseFloat(formData.get('exitPrice') as string);

    if (isNaN(exitPrice)) {
        return { error: 'Invalid exit price' };
    }

    try {
        // 1. Fetch Trade
        const trade = await prisma.trade.findUnique({
            where: { id: tradeId },
            include: { account: true }
        });

        if (!trade || trade.account.userId !== session.user.id) {
            return { error: 'Unauthorized or Trade not found' };
        }

        if (trade.status === 'CLOSED') {
            return { error: 'Trade already closed' };
        }

        // 2. Calculate PnL
        let pnl = 0;
        let revenue = 0; // For Spot
        let marginToReturn = 0; // For Futures

        if (trade.side === 'LONG') {
            pnl = (exitPrice - trade.entryPrice) * trade.quantity;
        } else {
            pnl = (trade.entryPrice - exitPrice) * trade.quantity;
        }

        // 3. Update Balance
        // Spot: Return Revenue (Cost + PnL)
        // Futures: Return Margin + PnL
        let balanceChange = 0;

        if (trade.type === 'SPOT') {
            // Revenue = Exit * Qty
            // We originally deducted Cost = Entry * Qty
            // So adding Revenue effectively adds Cost + PnL
            balanceChange = exitPrice * trade.quantity;
        } else {
            // Futures
            // We deducted Margin = (Entry * Qty) / Lev
            // We return Margin + PnL
            // Note: If PnL is negative, we return less than margin (or debt if liquidated, but simplified here)
            marginToReturn = trade.marginUsed || 0;
            balanceChange = marginToReturn + pnl;
        }

        // 4. DB Updates
        await prisma.$transaction([
            prisma.trade.update({
                where: { id: tradeId },
                data: {
                    exitPrice,
                    closeTime: new Date(),
                    netPnL: pnl,
                    status: 'CLOSED'
                }
            }),
            prisma.account.update({
                where: { id: accountId },
                data: {
                    currentBalance: { increment: balanceChange },
                    // Equity should technically be strictly updated, but our simplistic equity is balance + unrealized. 
                    // When closed, it becomes balance. So incrementing balance updates equity implicitly if we recalc.
                    // But here we store equity. Let's update equity by PnL.
                    equity: { increment: pnl }
                }
            })
        ]);

    } catch (error) {
        console.error('Close Trade Error:', error);
        return { error: 'Failed to close trade' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}

export async function closeGridStrategy(
    strategyId: string,
    accountId: string,
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const exitPrice = parseFloat(formData.get('exitPrice') as string);
    const gridProfit = parseFloat(formData.get('gridProfit') as string);
    const totalProfit = parseFloat(formData.get('totalProfit') as string);
    const closeNote = formData.get('closeNote') as string;

    if (isNaN(exitPrice)) {
        return { error: 'Invalid exit price' };
    }

    try {
        const strategy = await prisma.gridStrategy.findUnique({
            where: { id: strategyId },
            include: { account: true }
        });

        if (!strategy || strategy.account.userId !== session.user.id) {
            return { error: 'Unauthorized or strategy not found' };
        }

        if (strategy.status === 'CLOSED') {
            return { error: 'Strategy already closed' };
        }

        await prisma.gridStrategy.update({
            where: { id: strategyId },
            data: {
                status: 'CLOSED',
                exitPrice,
                gridProfit: isNaN(gridProfit) ? 0 : gridProfit,
                totalProfit: isNaN(totalProfit) ? 0 : totalProfit,
                closeNote,
                updatedAt: new Date(),
            }
        });

    } catch (error) {
        console.error('Close Grid Error:', error);
        return { error: 'Failed to close grid strategy' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}
