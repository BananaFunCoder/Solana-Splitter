# Solana Payment Splitter

A web application for distributing SOL payments among 2-5 wallets according to specified percentages.

## Features

- 🔐 **Wallet Integration** - Connect with Phantom, Solflare, and other popular Solana wallets
- 💰 **Flexible Distribution** - Split payments among 2-5 recipients with custom percentages
- ✅ **Real-time Validation** - Instant feedback on addresses and percentage allocation
- 🎨 **Modern UI** - Premium dark theme with smooth animations
- 🔍 **Transaction Tracking** - View confirmed transactions on Solana Explorer
- 🌐 **Devnet Support** - Safe testing environment on Solana Devnet

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2.10 or later
- A Solana wallet (Phantom or Solflare recommended)
- Some devnet SOL for testing (get from [Solana Faucet](https://faucet.solana.com/))

### Installation

```bash
bun install
```

### Development

Start the development server with hot module replacement:

```bash
bun dev
```

The application will be available at `http://localhost:3000`

### Production

Build and run for production:

```bash
bun start
```

## Usage

1. **Connect Wallet** - Click the wallet button to connect your Solana wallet
2. **Enter Amount** - Specify the total amount of SOL to split
3. **Add Recipients** - Enter wallet addresses and set percentages (must sum to 100%)
4. **Send Payment** - Review and approve the transaction in your wallet
5. **Confirm** - View the transaction confirmation on Solana Explorer

## Network Configuration

By default, the application uses **Solana Devnet** for safe testing. To change the network:

1. Open `src/lib/solana.ts`
2. Update the `SOLANA_RPC_ENDPOINT` constant
3. Also update the endpoint in `src/App.tsx`

**Devnet:** `https://api.devnet.solana.com`  
**Mainnet-beta:** `https://api.mainnet-beta.solana.com`

> ⚠️ **Warning:** Always test thoroughly on devnet before using mainnet!

## Technology Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Blockchain:** Solana Web3.js + Wallet Adapter
- **Runtime:** Bun
- **Build:** Custom Bun build script

## Project Structure

```
src/
├── components/
│   ├── PaymentSplitter.tsx    # Main application component
│   ├── RecipientInput.tsx     # Individual recipient form
│   ├── TransactionStatus.tsx  # Transaction progress display
│   ├── WalletButton.tsx       # Wallet connection UI
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── solana.ts             # Solana blockchain utilities
│   └── validation.ts         # Form validation logic
├── App.tsx                   # Root component with providers
└── index.tsx                 # Application entry point
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
