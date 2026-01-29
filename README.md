# Smart Journal - Professional Trading Journal & Portfolio Management System

Smart Journal is a comprehensive trading journal, portfolio, and strategy management application designed for serious traders who prioritize accuracy, capital safety, and clarity over visual polish. Built with Next.js, TypeScript, and PostgreSQL, it offers a robust platform for tracking balances, equity, profits, and drawdowns across multiple accounts.

## 🎯 Core Features

### Multi-Account Management
- Support for multiple account types (Personal, Prop firm, Demo)
- Track starting balance, current balance, and equity
- Monitor realized & unrealized P&L
- Margin tracking for futures accounts
- Daily, weekly, and monthly performance reports

### Manual Trade Journal (Spot & Futures)
- Support for both spot and futures trades
- Detailed trade tracking including entry/exit prices, stop losses, take profits
- Position sizing and leverage configuration
- Setup thesis, execution notes, and post-trade reviews
- Screenshot uploads for chart analysis

### Advanced Grid Trading Module
- Dedicated support for spot and futures grid strategies
- Leverage-aware calculations with liquidation risk assessment
- Flexible reserve margin logic (auto or manual)
- Geometric mean-based entry price calculations
- Real-time P&L tracking and risk monitoring

### Spot Holdings & Portfolio Tracking
- Long-term portfolio management
- Multiple spot portfolios per account
- Allocation percentages and performance analytics
- Unrealized P&L tracking

### Performance Analytics
- Win rate and expectancy calculations
- Risk-to-reward distribution analysis
- Equity and drawdown curves
- Leverage-specific metrics (Return on Margin, liquidation distances)
- Breakdowns by strategy type, symbol, and time periods

### Open Positions Monitoring
- Unified view across manual trades, grid strategies, and spot holdings
- Real-time margin usage and liquidation distance tracking
- Controls for manual position closing

## 🛠 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19** 
- **TypeScript**
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend & Database
- **Next.js Serverless Functions**
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **Zod** for schema validation

### Additional Libraries
- **BcryptJS** for password hashing
- **Next Themes** for theme management

## 🔐 Security & Authentication

- Secure email/password authentication
- Per-user data isolation
- JWT-based sessions
- Encrypted sensitive fields
- Role-ready architecture
- Audit logs for all financial state changes

## 📊 Risk Management Features

### Futures Trading Safety
- Explicit leverage configuration required
- Liquidation risk tracking and visualization
- Maintenance margin calculations
- Estimated liquidation price formulas:
  - Long: `P_liq = P_avg × (1 - 1/Leverage + MMRate)`
  - Short: `P_liq = P_avg × (1 + 1/Leverage - MMRate)`

### Grid Trading Improvements
- Geometric mean for accurate entry price calculations
- Flexible reserve margin options (auto-reserve from investment or manual reserve from available balance)
- Safety warnings when liquidation prices are within grid range
- Distance-to-liquidation calculations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-journal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then update `.env.local` with your database connection details and authentication secrets.

4. Run database migrations:
```bash
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧪 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── auth/             # Authentication logic
│   ├── components/       # Reusable UI components
│   ├── lib/              # Business logic and utilities
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── prisma/               # Database schema and migrations
├── scripts/              # Utility scripts
└── types/                # Global type definitions
```

## 🚀 Deployment

Deploy on Vercel for the best Next.js experience:
1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Set build command to `npm run build`
4. Set output directory to `out`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This software is provided for educational and personal use. Trading involves substantial risk and may not be suitable for all investors. Past performance does not guarantee future results. Always conduct your own research and consider consulting with qualified professionals before making investment decisions.
