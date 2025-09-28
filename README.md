# SynapseModel

A decentralized AI model marketplace that combines blockchain technology with distributed computing to create a platform for sharing, discovering, and running AI models. SynapseModel leverages Walrus for decentralized storage, Polygon blockchain for model registry, and Fluence for distributed model execution.

## 🌟 Features

- **Decentralized Model Registry**: Store AI model metadata on the Polygon blockchain with model files on Walrus decentralized storage
- **Model Marketplace**: Browse, discover, and interact with AI models uploaded by the community
- **Interactive Playground**: Test AI models in real-time with a built-in chat interface
- **Web3 Integration**: Connect your wallet to upload models, make payments, and interact with the blockchain
- **Distributed Computing**: Execute AI models on Fluence's decentralized computing network
- **Multiple Model Types**: Support for text, image, audio, embedding, and multimodal AI models
- **Flexible Pricing**: Free, hourly, and custom pricing models for AI services

## 🏗️ Architecture

SynapseModel consists of three main components:

1. **Frontend**: React/TypeScript application with Web3 integration
2. **Backend**: FastAPI server managing Fluence VM operations
3. **Smart Contracts**: Solidity contracts on Polygon for model registry

### Technology Stack

#### Frontend
- **React 19** with TypeScript and Vite
- **Tailwind CSS** for styling with shadcn/ui components
- **Web3 Integration**: wagmi, viem, and Web3Modal
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **UI Components**: Radix UI primitives

#### Backend
- **FastAPI** (Python) for API endpoints
- **Fluence SDK** for decentralized computing
- **SSH/Paramiko** for VM management
- **HTTPX** for async HTTP requests

#### Blockchain
- **Polygon** network for smart contracts
- **Walrus** for decentralized file storage
- **Solidity** smart contracts for model registry

## 📦 Installation

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+
- A Web3 wallet (MetaMask recommended)
- Fluence API key
- Polygon network access

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your configuration:
```env
FLUENCE_API_KEY=your_fluence_api_key
FLUENCE_API_URL=https://api.fluence.dev
```

4. Start the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## 🚀 Usage

### Uploading Models

1. Connect your Web3 wallet
2. Navigate to the Upload page
3. Fill in model metadata (name, description, type)
4. Upload your model file (stored on Walrus)
5. Confirm the blockchain transaction

### Browsing Models

1. Visit the Models page to browse available AI models
2. Use filters to find models by type, pricing, or tags
3. Click on any model to view details and pricing

### Using the Playground

1. Select a model from the marketplace
2. Click "Try in Playground"
3. Configure model parameters (temperature, max tokens, etc.)
4. Start chatting with the AI model
5. Pay for usage based on the model's pricing structure

### Running Models on Fluence

The platform automatically:
1. Creates Fluence VMs for model execution
2. Downloads models from Walrus storage
3. Manages model lifecycle and billing
4. Provides real-time streaming responses

## 🏛️ Smart Contracts

### ModelRegistry Contract

Located in `Contract/ModelRegistry.sol`, this contract manages:

- Model metadata storage on-chain
- Uploader verification and permissions
- Model discovery and retrieval
- Update capabilities for model owners

Key functions:
- `uploadModel()`: Register a new model with metadata
- `getMetadata()`: Retrieve model information
- `getAllModels()`: List all available models
- `updateMetadata()`: Update existing model data

## 🔧 Configuration

### Web3 Configuration

Configure your Web3 settings in `frontend/lib/web3.ts`:
- Supported networks (Polygon mainnet/testnet)
- Contract addresses
- Wallet connection options

### Fluence Integration

Set up Fluence configuration in your environment:
- API keys for VM management
- Computing resource allocation
- Model execution parameters

## 🧪 Development

### Project Scripts

#### Frontend
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

#### Backend
```bash
uvicorn main:app --reload    # Start with auto-reload
uvicorn main:app --host 0.0.0.0 --port 8000  # Production mode
```

### Code Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route components
│   ├── lib/           # Utilities and API clients
│   └── types/         # TypeScript type definitions
├── components/        # Additional components
└── public/           # Static assets

backend/
├── main.py           # FastAPI application
├── requirements.txt  # Python dependencies
└── deploy.ps1       # Deployment script

Contract/
└── ModelRegistry.sol # Smart contract
```

## 🌐 Deployment

### Frontend Deployment

Build the frontend for production:
```bash
cd frontend
pnpm build
```

Deploy the `dist` folder to your preferred hosting service (Vercel, Netlify, etc.).

### Backend Deployment

1. Use the provided PowerShell script:
```bash
# Edit deploy.ps1 with your server details
./deploy.ps1
```

2. Or manually deploy to your server:
```bash
# Install dependencies on server
pip install -r requirements.txt

# Run with gunicorn for production
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Smart Contract Deployment

Deploy the ModelRegistry contract to Polygon:
1. Compile the contract using Hardhat or Foundry
2. Deploy to Polygon mainnet or testnet
3. Update contract addresses in the frontend configuration

## 🤝 Contributing

We welcome contributions to SynapseModel! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Ensure responsive design for all UI changes
- Test Web3 integrations thoroughly

## 🔐 Security

- Smart contracts should be audited before mainnet deployment
- Store private keys and API keys securely
- Use environment variables for sensitive configuration
- Regularly update dependencies for security patches

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fluence](https://fluence.dev/) for decentralized computing infrastructure
- [Walrus](https://walrus.site/) for decentralized storage
- [Polygon](https://polygon.technology/) for blockchain infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## 📞 Support

For questions, issues, or contributions:

- Create an issue in this repository
- Join our community discussions
- Check the documentation for detailed API references

---

**Built with ❤️ for the decentralized AI future**