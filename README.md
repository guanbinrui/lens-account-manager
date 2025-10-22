# MetaMask Wallet Connector

A Next.js application that enables users to connect and manage their MetaMask wallet for Ethereum interactions.

## Features

- **MetaMask Integration**: Connect to Ethereum network via MetaMask wallet
- **Real-time Balance Display**: View ETH balance in real-time
- **Account Management**: View connected address and manage connection
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **TypeScript Support**: Full type safety throughout the application

## Prerequisites

Before running this application, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or later)
- [MetaMask](https://metamask.io/) browser extension

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd web3-wallet-connector
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with wallet provider
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── WalletButton.tsx   # Wallet connection button
│   └── WalletDashboard.tsx # Main dashboard component
├── context/               # React context providers
│   └── WalletContext.tsx  # Wallet state management
├── hooks/                 # Custom React hooks
│   └── useEthereumWallet.ts # Ethereum/MetaMask integration
└── types/                 # TypeScript type definitions
    └── wallet.ts          # Wallet-related types
```

## Usage

### Connecting Your Wallet

1. **MetaMask Setup**:
   - Install the MetaMask browser extension
   - Create or import an Ethereum wallet
   - Make sure MetaMask is unlocked

2. **Connecting**:
   - Click "Connect MetaMask" button
   - Approve the connection in the MetaMask popup
   - Your Ethereum address and ETH balance will be displayed

### Managing Your Connection

- **Refresh Balance**: Update your ETH balance manually
- **Disconnect**: Click the disconnect button to remove wallet connection
- **Account Switching**: The app automatically detects when you switch accounts in MetaMask

## Technical Details

### Libraries Used

- **Next.js 15**: React framework with App Router
- **ethers.js**: Ethereum blockchain interaction
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

### Wallet Detection

The application automatically detects MetaMask by checking for `window.ethereum`.

### Network Configuration

- **Ethereum**: Connects to the current network selected in MetaMask
- **Supported Networks**: Any Ethereum-compatible network (Mainnet, Goerli, Sepolia, etc.)

## Security Considerations

- The application only requests wallet connection permissions
- No private keys or sensitive data are stored or transmitted
- All wallet interactions use official MetaMask APIs
- Balance information is fetched directly from the Ethereum network
- The app respects MetaMask's security model and user permissions

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **MetaMask not detected**:
   - Ensure MetaMask extension is installed and enabled
   - Refresh the page after installing MetaMask
   - Check browser console for error messages

2. **Connection failed**:
   - Make sure MetaMask is unlocked
   - Try disconnecting and reconnecting
   - Check if MetaMask is on a supported network

3. **Balance not showing**:
   - Network issues may prevent balance fetching
   - Click "Refresh Balance" to retry
   - Ensure you're connected to the correct network

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
