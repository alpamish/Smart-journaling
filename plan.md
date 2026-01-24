Calculating the estimated liquidation price (est.liq.price) for a Futures Grid Bot is more complex than for a standard trade because the position size changes constantly as the bot buys and sells within the range.

However, to calculate the worst-case scenario (the price at which you would get liquidated if the price crashes or pumps instantly), we assume the bot is holding its maximum possible position.

Here is the step-by-step method to calculate it.

1. Identify the Variables
You need the following parameters:

P 
min
​
 
: Lower Price Limit of your grid.
P 
max
​
 
: Upper Price Limit of your grid.
L
: Leverage (e.g., 10x, 20x). Note: You must know this to calculate liq. price.
M
: Reserved Margin (The total collateral you allocated).
MM
: Maintenance Margin Rate (Usually 0.5% or 0.005 for major pairs on most exchanges like Binance/Bybit).
2. The Calculation Logic
Since the grid buys the most at the bottom and sells the most at the top, the riskiest moments are at the boundaries of your range.

A. Calculate the Average Entry Price (
P 
avg
​
 
)
Because a grid bot accumulates position gradually, it doesn't buy all at one price. The best estimation for the average entry price when the bot is "fully loaded" (holding max bags) is the Geometric Mean of your range.

P 
avg
​
 = 
P 
min
​
 ×P 
max
​
 
​
 

B. Calculate the Total Position Value (
V 
pos
​
 
)
This is the total size of your position in USDT when fully invested.
V 
pos
​
 =Reserved Margin(M)×Leverage(L)

C. Calculate the Liquidation Price
Now apply the standard Isolated Margin liquidation formula using the values above.

For a LONG Grid:
The liquidation price is below your Lower Price (
P 
min
​
 
).
P 
liq_long
​
 =P 
avg
​
 ×(1− 
L
1
​
 +MM)

For a SHORT Grid:
The liquidation price is above your Upper Price (
P 
max
​
 
).
P 
liq_short
​
 =P 
avg
​
 ×(1+ 
L
1
​
 −MM)
3. Example Calculation
Let's say you are setting up a BTC Long Grid:

Price Range: 
60,000 to $50,000 ($P_{max}
 to 
P 
min
​
 
)
Reserved Margin: $1,000
Leverage: 10x
Maintenance Margin: 0.5% (0.005)
Step A: Average Entry Price
P 
avg
​
 = 
60,000×50,000
​
 = 
3,000,000,000
​
 ≈54,772

Step B: Apply Long Formula
P 
liq
​
 =54,772×(1− 
10
1
​
 +0.005)
 
P 
liq
​
 =54,772×(1−0.1+0.005)
 
P 
liq
​
 =54,772×0.905
 
P 
liq
​
 ≈49,569

Conclusion: If the price drops below $49,569, you will likely be liquidated. Since this is very close to your grid lower limit of $50,000, this is a dangerous setup.

4. Vital Rule of Thumb for Grid Safety
To ensure your grid bot does not get liquidated before it finishes its cycle, your Liquidation Price must stay outside your grid range.

Safe Long Formula:
P 
liq
​
 <P 
min
​
 
 Substituting the logic:
P 
avg
​
 ×(1− 
L
1
​
 )<P 
min
​
 

**Safe Short Formula:**
P 
liq
​
 >P 
max
​
 
 
P 
avg
​
 ×(1+ 
L
1
​
 )>P 
max
​
 

Quick Safety Check (using the example above):
P 
min
​
 =50,000
 * Calculated 
P 
liq
​
 =49,569
 * Result: 
49,569<50,000
. The liquidation price is inside the range.
Fix: You need to lower your leverage (e.g., to 5x) or widen your price range (e.g., lower 
P 
min
​
 
 to 45k).
Summary
Calculate Average Price: 
High×Low
​
 
 2. Calculate Long Liq: 
Avg Price×(1−1/Leverage)
 3. Ensure the result is safely below your lowest grid line.
