/**
 * Futures Grid Calculation Module
 * Implements margin, leverage, and liquidation logic based on Pionex-like formulas.
 */

export interface GridInputs {
    lowerPrice: number;
    upperPrice: number;
    gridCount: number;
    investment: number; // initial margin
    leverage: number;
    maintenanceMarginRate: number;
    autoReserveMargin: boolean;
    manualReservedMargin?: number;
    positionSide: 'LONG' | 'SHORT' | 'NEUTRAL';
    entryPrice?: number;
    availableBalance?: number; // total available balance for manual reserve calculation
}

export interface GridResults {
    gridStep: number;
    positionSize: number;
    maintenanceMargin: number;
    liquidationPrices: {
        long?: number;
        short?: number;
    };
    reservedMargin: number;
    usableMargin: number;
    reserveRate: number;
    warnings: string[];
}

export function calculateFuturesGrid(inputs: GridInputs): GridResults {
    const {
        lowerPrice,
        upperPrice,
        gridCount,
        investment,
        leverage,
        maintenanceMarginRate,
        autoReserveMargin,
        manualReservedMargin,
        positionSide,
        entryPrice: providedEntryPrice,
        availableBalance
    } = inputs;

    const warnings: string[] = [];

    // 0. Base Calculations
    // Entry price (default = geometric mean for more accurate liquidation calculation)
    const entryPrice = providedEntryPrice || Math.sqrt(lowerPrice * upperPrice);
    // Grid step = (upper_price - lower_price) / grid_count
    const gridStep = (upperPrice - lowerPrice) / gridCount;

    // 1. Position Size
    // Rule: position_size = investment * leverage
    // (reserved margin does NOT reduce position size)
    const positionSize = investment * leverage;

    // 2. Reserve Rate Calculation
    // reserve_rate = 0.08 + (grid_count / 600) + (leverage / 25) + ((upper_price - lower_price) / entry_price) * 0.5
    // Clamped between 0.10 and 0.35
    let calculatedReserveRate = 0.08 + (gridCount / 600) + (leverage / 25) + ((upperPrice - lowerPrice) / entryPrice) * 0.5;
    calculatedReserveRate = Math.max(0.10, Math.min(0.35, calculatedReserveRate));

    // 3. Reserved Margin
    let reservedMargin = 0;
    if (autoReserveMargin) {
        // Auto Reserve: Reserve margin comes from investment amount
        reservedMargin = investment * calculatedReserveRate;
    } else {
        // Manual Reserve: Reserve margin comes from available balance
        // If manual value not provided, use calculated rate on available balance
        if (manualReservedMargin) {
            reservedMargin = manualReservedMargin;
        } else if (availableBalance) {
            reservedMargin = Math.min(availableBalance * calculatedReserveRate, availableBalance);
        } else {
            reservedMargin = 0;
        }
    }

    // 4. Usable Margin
    // For auto reserve: usable margin = investment - reserved margin
    // For manual reserve: usable margin = investment (since reserve comes from available balance)
    const usableMargin = autoReserveMargin ? (investment - reservedMargin) : investment;

    // 5. Maintenance Margin
    const maintenanceMargin = positionSize * maintenanceMarginRate;

    // 6. Liquidation Price Calculation
    const liquidationPrices: { long?: number; short?: number } = {};

    if (positionSide === 'LONG') {
        // Liquidation Price (Long) using geometric mean method from plan.md
        // P_liq_long = P_avg × (1 - 1/Leverage + MaintenanceMarginRate)
        liquidationPrices.long = entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
    } else if (positionSide === 'SHORT') {
        // Liquidation Price (Short) using geometric mean method from plan.md
        // P_liq_short = P_avg × (1 + 1/Leverage - MaintenanceMarginRate)
        liquidationPrices.short = entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
    } else if (positionSide === 'NEUTRAL') {
        // Neutral Grid: Split investment and reserved margin equally
        // Apply the same geometric mean method for both long and short positions
        liquidationPrices.long = entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
        liquidationPrices.short = entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
    }

    // 7. Validation
    if (usableMargin <= maintenanceMargin) {
        throw new Error("No enough balance");
    }
    // Also fail if usable margin is negative (manual reserve too high)
    if (usableMargin < 0) {
        throw new Error("Reserved margin exceeds investment");
    }


    // 8. Warnings
    if (liquidationPrices.long !== undefined) {
        if (liquidationPrices.long >= lowerPrice) {
            warnings.push('Liquidation price (LONG) is within the grid range!');
        }
    }
    if (liquidationPrices.short !== undefined) {
        if (liquidationPrices.short <= upperPrice) {
            warnings.push('Liquidation price (SHORT) is within the grid range!');
        }
    }

    return {
        gridStep,
        positionSize,
        maintenanceMargin,
        liquidationPrices,
        reservedMargin,
        usableMargin,
        reserveRate: calculatedReserveRate,
        warnings
    };
}
