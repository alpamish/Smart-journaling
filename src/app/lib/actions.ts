'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Added auth import
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import fs from 'node:fs/promises';
import path from 'node:path';

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

export async function getTradeConditions(type: 'ENTRY' | 'EXIT') {
    return await prisma.tradeCondition.findMany({
        where: { type },
        orderBy: { name: 'asc' }
    });
}

export async function createTrade(
    accountId: string,
    prevState: any,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const type = 'FUTURES';
    const segment = formData.get('segment') as string;
    const symbol = formData.get('symbol') as string;
    const side = formData.get('side') as 'LONG' | 'SHORT';
    const marginMode = formData.get('marginMode') as string;
    const tradeType = formData.get('tradeType') as string;
    const sessionName = formData.get('session') as string;
    const entryDate = formData.get('entryDate') ? new Date(formData.get('entryDate') as string) : new Date();
    const analysisTimeframe = formData.get('analysisTimeframe') as string;
    const entryTimeframe = formData.get('entryTimeframe') as string;
    const entryCondition = formData.get('entryCondition') as string;

    // Risk & Position
    const stopLoss = formData.get('stopLoss') ? parseFloat(formData.get('stopLoss') as string) : null;
    const takeProfit = formData.get('takeProfit') ? parseFloat(formData.get('takeProfit') as string) : null;
    const quantity = parseFloat(formData.get('quantity') as string);
    const entryPrice = parseFloat(formData.get('entryPrice') as string);
    const leverage = parseFloat(formData.get('leverage') as string) || 1;
    const remarks = formData.get('remarks') as string;

    // Exit Details (if closing while logging)
    const exitPrice = formData.get('exitPrice') ? parseFloat(formData.get('exitPrice') as string) : null;
    const exitQuantity = formData.get('exitQuantity') ? parseFloat(formData.get('exitQuantity') as string) : null;
    const exitCondition = formData.get('exitCondition')?.toString().trim() || '';
    const exitDate = formData.get('exitDate') ? new Date(formData.get('exitDate') as string) : (exitPrice ? new Date() : null);

    if (!symbol || isNaN(quantity) || isNaN(entryPrice)) {
        return { error: 'Invalid input' };
    }

    try {
        const account = await prisma.account.findUnique({
            where: { id: accountId, userId: session.user.id }
        });

        if (!account) return { error: 'Account not found' };

        const marginUsed = (quantity * entryPrice) / leverage;
        if (marginUsed > account.currentBalance) {
            return { error: 'Insufficient margin' };
        }

        // Handle Trade Condition (Dynamic Insert)
        if (entryCondition && entryCondition.trim()) {
            const trimmedEntry = entryCondition.trim();
            const existingEntryCondition = await prisma.tradeCondition.findUnique({
                where: { name_type: { name: trimmedEntry, type: 'ENTRY' } }
            });

            if (!existingEntryCondition) {
                await prisma.tradeCondition.create({
                    data: { name: trimmedEntry, type: 'ENTRY' },
                });
            }
        }

        if (exitCondition && exitCondition.trim()) {
            const trimmedExit = exitCondition.trim();
            const existingExitCondition = await prisma.tradeCondition.findUnique({
                where: { name_type: { name: trimmedExit, type: 'EXIT' } }
            });

            if (!existingExitCondition) {
                await prisma.tradeCondition.create({
                    data: { name: trimmedExit, type: 'EXIT' },
                });
            }
        }

        const trade = await prisma.trade.create({
            data: {
                accountId,
                type,
                segment,
                symbol: symbol.toUpperCase(),
                side,
                marginMode,
                tradeType,
                session: sessionName,
                entryDate,
                analysisTimeframe,
                entryTimeframe,
                entryCondition,
                entryPrice,
                stopLoss,
                takeProfit: takeProfit,
                quantity,
                leverage,
                marginUsed,
                remarks,
                exitPrice,
                exitQuantity,
                exitCondition,
                exitDate,
                status: (exitPrice && exitQuantity === quantity) ? 'CLOSED' : 'OPEN',
                netPnL: exitPrice ? (side === 'LONG' ? (exitPrice - entryPrice) * (exitQuantity || quantity) : (entryPrice - exitPrice) * (exitQuantity || quantity)) : null,
                netPnLPercent: exitPrice ? (((side === 'LONG' ? (exitPrice - entryPrice) * (exitQuantity || quantity) : (entryPrice - exitPrice) * (exitQuantity || quantity)) / marginUsed) * 100) : null,
            },
        });

        // 4. Handle Images
        const files = formData.getAll('images') as File[];
        for (const file of files) {
            if (file.size > 0 && file.name) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `${Date.now()}-${file.name}`;
                const filePath = path.join(process.cwd(), 'public/uploads', fileName);
                await fs.writeFile(filePath, buffer);

                await prisma.image.create({
                    data: {
                        url: `/uploads/${fileName}`,
                        tradeId: trade.id
                    }
                });
            }
        }

        // 5. Update Account Balance
        // If OPEN: decrement marginUsed
        // If CLOSED: adjustment = pnl; decrement -pnl (effectively increment pnl)
        const pnl = trade.netPnL || 0;
        const balanceChange = exitPrice ? -pnl : marginUsed;

        await prisma.account.update({
            where: { id: accountId },
            data: {
                currentBalance: { decrement: balanceChange },
                equity: { increment: exitPrice ? pnl : 0 }
            }
        });

        revalidatePath(`/dashboard/accounts/${accountId}`);
        return { success: true };
    } catch (error) {
        console.error('Create Trade Error:', error);
        return { error: 'Failed to log trade.' };
    }
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
    const targetPrice = formData.get('targetPrice') ? parseFloat(formData.get('targetPrice') as string) : null;
    const status = (formData.get('status') as string) || 'HODLING';
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
                targetPrice,
                status,
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
    const exitQuantity = parseFloat(formData.get('exitQuantity') as string);
    const exitCondition = formData.get('exitCondition')?.toString().trim() || '';
    const exitDate = formData.get('exitDate') ? new Date(formData.get('exitDate') as string) : new Date();

    if (isNaN(exitPrice) || isNaN(exitQuantity) || exitQuantity <= 0) {
        return { error: 'Invalid exit price or quantity' };
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

        if (exitQuantity > trade.quantity) {
            return { error: 'Exit quantity cannot exceed position size' };
        }

        if (exitCondition && exitCondition.trim()) {
            const trimmedExit = exitCondition.trim();
            const existingExitCondition = await prisma.tradeCondition.findUnique({
                where: { name_type: { name: trimmedExit, type: 'EXIT' } }
            });

            if (!existingExitCondition) {
                await prisma.tradeCondition.create({
                    data: { name: trimmedExit, type: 'EXIT' },
                });
            }
        }

        // 2. Calculations
        const isPartial = exitQuantity < trade.quantity;
        const unitPnL = trade.side === 'LONG' ? (exitPrice - trade.entryPrice) : (trade.entryPrice - exitPrice);
        const pnl = unitPnL * exitQuantity;

        const leverage = trade.leverage || 1;
        const exitedMargin = (exitQuantity * trade.entryPrice) / leverage;
        const balanceChange = exitedMargin + pnl;

        if (isPartial) {
            // Partial Close
            await prisma.$transaction([
                // Create a secondary CLOSED trade for history
                prisma.trade.create({
                    data: {
                        accountId,
                        type: trade.type,
                        segment: trade.segment,
                        symbol: trade.symbol,
                        side: trade.side,
                        marginMode: trade.marginMode,
                        tradeType: trade.tradeType,
                        session: trade.session,
                        entryDate: trade.entryDate,
                        analysisTimeframe: trade.analysisTimeframe,
                        entryTimeframe: trade.entryTimeframe,
                        entryCondition: trade.entryCondition,
                        entryPrice: trade.entryPrice,
                        stopLoss: trade.stopLoss,
                        takeProfit: trade.takeProfit,
                        quantity: exitQuantity,
                        leverage: trade.leverage,
                        marginUsed: exitedMargin,
                        remarks: `Partial exit from trade ${trade.id}. ${exitCondition}`,
                        exitPrice,
                        exitQuantity,
                        exitCondition,
                        exitDate,
                        status: 'CLOSED',
                        parentId: trade.id,
                        netPnL: pnl,
                        netPnLPercent: (pnl / exitedMargin) * 100,
                    }
                }),
                // Update original trade
                prisma.trade.update({
                    where: { id: tradeId },
                    data: {
                        quantity: { decrement: exitQuantity },
                        marginUsed: { decrement: exitedMargin },
                    }
                }),
                // Update account balance
                prisma.account.update({
                    where: { id: accountId },
                    data: {
                        currentBalance: { increment: balanceChange },
                        equity: { increment: pnl }
                    }
                })
            ]);
        } else {
            // Full Close
            await prisma.$transaction([
                prisma.trade.update({
                    where: { id: tradeId },
                    data: {
                        exitPrice,
                        exitQuantity,
                        exitDate,
                        exitCondition,
                        netPnL: pnl,
                        netPnLPercent: (pnl / (trade.marginUsed || 1)) * 100,
                        status: 'CLOSED'
                    }
                }),
                prisma.account.update({
                    where: { id: accountId },
                    data: {
                        currentBalance: { increment: balanceChange },
                        equity: { increment: pnl }
                    }
                })
            ]);
        }

        revalidatePath(`/dashboard/accounts/${accountId}`);
        return { success: true };
    } catch (error) {
        console.error('Close Trade Error:', error);
        return { error: 'Failed to close trade' };
    }
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

export async function closeSpotHolding(
    holdingId: string,
    accountId: string,
    prevState: any,
    formData: FormData,
) {
    // Add logic to close a spot holding position
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const exitPrice = parseFloat(formData.get('exitPrice') as string);
    const status = formData.get('status') as string;

    if (isNaN(exitPrice)) {
        return { error: 'Invalid exit price' };
    }

    try {
        const holding = await prisma.spotHolding.findUnique({
            where: { id: holdingId },
            include: { account: true }
        });

        if (!holding || holding.account.userId !== session.user.id) {
            return { error: 'Unauthorized or holding not found' };
        }

        await prisma.spotHolding.update({
            where: { id: holdingId },
            data: {
                status,
                exitPrice,
                updatedAt: new Date(),
            }
        });

    } catch (error) {
        console.error('Close Holding Error:', error);
        return { error: 'Failed to close holding' };
    }

    revalidatePath(`/dashboard/accounts/${accountId}`);
    return { success: true };
}
