# Cloudilic Workflow Application

A full-stack web application that allows users to visually create workflows for PDF processing with AI integration using React Flow.

## 🎯 Features

- **Visual Workflow Builder**: Drag-and-drop interface using React Flow
- **PDF Processing**: Upload and parse PDF documents
- **Semantic Search**: FAISS-based vector search for relevant content
- **AI Integration**: OpenAI API for intelligent responses
- **Real-time Execution**: Execute workflows and see results instantly

## 🏗️ Architecture

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Storage**: In-memory storage with file-based FAISS indexes
- **PDF Processing**: pdf-parse library
- **Vector Search**: FAISS for semantic search
- **AI Integration**: OpenAI API
- **Design Patterns**: Following Refactoring Guru patterns
  - Service Layer Pattern
  - Repository Pattern (simplified)
  - DTO Pattern
  - Controller Pattern
  - Dependency Injection

### Frontend (React)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Framework**: Tailwind CSS
- **Flow Builder**: React Flow
- **Testing**: Vitest with Testing Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cloudilic-assasment
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Backend
   cd backend
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Start the application**
   ```bash
   # From root directory
   npm run dev
   ```

This will start both backend (port 3000) and frontend (port 5173).

## 📁 Project Structure

```
cloudilic-assasment/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── shared/         # Shared services (memory store)
│   │   ├── workflow/       # Workflow module
│   │   ├── pdf/           # PDF processing module
│   │   ├── ai/            # AI integration module
│   │   ├── vector-search/ # FAISS vector search
│   │   ├── types/         # Shared TypeScript types
│   │   └── main.ts        # Application entry point
│   ├── package.json
│   └── env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
└── package.json           # Root package.json (monorepo)
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

This application is configured for easy deployment on Vercel with file-based storage.

#### Quick Deploy

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy using Vercel CLI**:

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   vercel --prod
   ```

3. **Set Environment Variables**:
   In your Vercel dashboard, add these environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`

#### Manual Deploy

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the monorepo structure

2. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`

3. **Set Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`

#### Deployment Features

- ✅ **File-Based Storage**: Vector indexes stored as JSON files
- ✅ **Serverless Functions**: Backend runs on Vercel Functions
- ✅ **Automatic Scaling**: Handles traffic spikes
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Zero Configuration**: Works out of the box

**Note**: File-based storage means indexes are ephemeral (reset on server restarts). This is perfect for demos and testing. For production with persistence, consider adding a database.

## 🎯 How to Use

1. **Upload PDF**: Drag and drop a PDF file in the sidebar
2. **Create Workflow**: Drag nodes from sidebar to canvas
3. **Connect Nodes**: Draw connections between nodes
4. **Configure**: Set up input queries and select PDFs for RAG nodes
5. **Execute**: Click "Run Workflow" to process

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build both frontend and backend
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Linting
npm run lint             # Lint both frontend and backend
npm run lint:frontend    # Lint frontend only
npm run lint:backend     # Lint backend only
```

## 🏗️ Architecture Notes

### Simplified Storage

- **In-Memory Storage**: Workflows and PDFs stored in memory during runtime
- **File-Based Indexes**: FAISS vector indexes saved as JSON files
- **No Database**: Eliminates complexity for this demo application

### Vector Search

- **FAISS Integration**: Efficient similarity search for PDF content
- **Chunking**: PDF content split into manageable chunks
- **Embeddings**: OpenAI embeddings for semantic search

### AI Integration

- **OpenAI API**: GPT-4o-mini for intelligent responses
- **Context-Aware**: Combines user queries with relevant PDF content
- **Error Handling**: Graceful fallbacks for API limitations

**Note**: Make sure to add your OpenAI API key to the backend `.env` file before running the application.
