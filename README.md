# Food RAG Web Application 🍽️

**AI-Powered Retrieval Augmented Generation System for Food Knowledge Discovery**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/aleeya-ahmads-projects/food-rag-web-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

## 📋 Project Overview

This is a professional full-stack web application that transforms a Python CLI RAG (Retrieval Augmented Generation) system into a modern, responsive web interface. It demonstrates the journey from local CLI development → cloud-based system → production-ready web application.

The application leverages **AI-assisted development** using v0.dev to build a sophisticated food knowledge assistant with real-time semantic search and LLM-powered responses.

### Key Features
- ✨ **AI-Powered Chat Interface** - Ask questions about food, cuisines, and cooking
- 🔍 **Semantic Search** - Vector-based similarity search using Upstash Vector Database
- 🧠 **LLM Integration** - Groq API for intelligent response generation  
- 📊 **Source Attribution** - See relevant sources with relevance scores
- 💾 **Conversation History** - Persistent chat memory with localStorage auto-save
- 🎨 **Professional UI/UX** - Modern, responsive design with dark mode support
- ⚡ **Real-time Streaming** - Stream AI responses in real-time with toggle option
- 📈 **Performance Metrics** - Track vector search time, LLM processing time, and token usage
- 📱 **Mobile-Optimized** - Fully responsive design for all devices

## 🚀 Live Demo

**[Visit the Live Application](https://v0-week4deliverable-vercel.vercel.app/)**

Try asking questions like:
- "What fruits are popular in tropical regions?"
- "Tell me about spicy foods and their origins"
- "What are some healthy vegetable options?"
- "What makes different cuisines unique?"

## 💾 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router and Server Actions
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Reusable component library
- **Lucide React** - Beautiful icon system
- **React Hooks** - State management

### Backend & AI
- **Upstash Vector** - Serverless vector database for semantic search
- **Groq API** - Fast LLM inference (llama-3.1-8b-instant)
- **Vercel AI SDK** - Streaming response support with @ai-sdk/groq
- **Next.js Server Actions** - Backend logic without REST API
- **Next.js API Routes** - Streaming API endpoint for real-time responses

### Deployment
- **Vercel** - Edge-optimized deployment and hosting
- **v0.dev** - AI-assisted UI generation and rapid development

## 📐 Architecture

### System Overview
```
User Query
    ↓
Next.js Chat Interface
    ↓
Vector Semantic Search (Upstash Vector)
    ├─ Retrieve Top 3 Similar Documents
    ├─ Extract Metadata & Relevance Scores
    └─ Format Context
        ↓
    LLM Processing (Groq API)
    ├─ Process Query + Context
    ├─ Generate Natural Language Response
    └─ Return Answer
        ↓
    Formatted Response with Sources
```

### Data Flow
1. **Input**: User submits a food-related question
2. **Vector Search**: Question is converted to embeddings and searched against knowledge base
3. **Context Retrieval**: Top 3 most relevant documents are retrieved with metadata
4. **LLM Processing**: Context + question sent to Groq API
5. **Response Generation**: AI generates contextualized answer
6. **Output**: Answer displayed with source attribution and relevance scores

## 📦 Project Structure

```
food-rag-web-app/
├── app/
│   ├── actions.ts          # Server actions for RAG queries
│   ├── api/
│   │   └── chat/
│   │       └── route.ts    # Streaming API endpoint
│   ├── layout.tsx          # Root layout with theme setup
│   ├── page.tsx            # Home page component
│   └── globals.css         # Global styles
├── components/
│   ├── food-chat.tsx       # Main chat interface
│   ├── header.tsx          # Header with branding
│   ├── footer.tsx          # Footer section
│   ├── particle-background.tsx  # Background effects
│   ├── theme-provider.tsx  # Dark/light mode
│   └── ui/                 # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── spinner.tsx
├── lib/
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── package.json           # Dependencies
├── next.config.mjs        # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.ts     # Tailwind CSS setup
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)
- Upstash Vector account with API credentials
- Groq API key

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Upstash Vector Database
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token

# Groq API
GROQ_API_KEY=your_groq_api_key
```

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Visit `http://localhost:3000` in your browser.

### Deployment

This project is configured for automatic deployment via Vercel:

1. Push to GitHub
2. Vercel automatically detects and deploys changes
3. Environment variables are synced via Vercel dashboard

## 📚 API Documentation

### Server Action: `ragQuery(question: string)`

**Location**: [app/actions.ts](app/actions.ts)

**Parameters**:
- `question` (string) - The user's food-related question

**Returns**:
```typescript
{
  sources: Array<{
    id: string
    score: number (0-1)
    metadata: {
      text: string
      category: string
      origin: string
    }
  }>,
  answer: string,
  metrics: {
    vectorSearchTime: number  // milliseconds
    llmProcessingTime: number // milliseconds
    totalResponseTime: number // milliseconds
    tokensUsed?: number       // total tokens used
  }
}
```

**Process**:
1. Converts question to vector embeddings
2. Searches Upstash Vector DB with `topK: 3`
3. Formats retrieved context
4. Sends to Groq API with system prompt
5. Returns formatted response with performance metrics

### Streaming API: `POST /api/chat`

**Location**: [app/api/chat/route.ts](app/api/chat/route.ts)

**Features**:
- Real-time text streaming using Vercel AI SDK
- Sources returned via response headers
- Performance metrics tracking

### Upstash Vector Integration

- **Endpoint**: Semantic vector search
- **Model**: Text embeddings (managed by Upstash)
- **TopK**: 3 most relevant results
- **Metadata**: Includes text, category, and origin

### Groq LLM Integration

- **Model**: `llama-3.1-8b-instant`
- **Temperature**: 0.7 (balanced creativity and accuracy)
- **Max Tokens**: 500
- **System Prompt**: Food knowledge assistant context
- **Streaming**: Optional real-time text streaming

## 🎨 UI Features

### Chat Interface Components

**Welcome State**
- Icon with sparkle animation
- Example questions for quick start
- Four categorized question templates

**Streaming Toggle**
- Toggle button to enable/disable streaming responses
- Visual indicator when streaming is active
- Animated cursor during active streaming

**Conversation History**
- Persistent localStorage-based chat memory
- Multiple concurrent conversations
- Auto-generated titles from first question
- Quick navigation between conversations
- One-click conversation deletion
- Shows last updated date for each conversation
- Toggle-able history sidebar (hidden on mobile for space)
- "New Chat" button for starting fresh conversations

**Message Display**
- User messages (right-aligned, blue gradient)
- AI responses (left-aligned with icon)
- Loading animation with dots
- Error handling with recovery guidance
- Auto-scrolling to latest messages
- Timestamps on each message

**Source Attribution**
- Ranked source cards with metadata
- Location badges for food origin
- Relevance percentage scoring
- Color-coded relevance (green 80%+, yellow 60%+, orange <60%)

**Input Area**
- Sticky input bar at bottom
- Auto-focus on load
- Send button with loading state
- Disabled state management

## 📊 Performance Metrics

### Real-Time Metrics Display
Each response now includes detailed performance metrics:
- **Vector Search Time** - Time to search Upstash Vector DB
- **LLM Processing Time** - Time for Groq API to generate response
- **Total Response Time** - End-to-end latency
- **Tokens Used** - Total tokens consumed (when available)

### Response Times (Approximate)
- **Vector Search**: 100-200ms
- **LLM Processing**: 500-1500ms (non-streaming) / Real-time (streaming)
- **Total Response**: 600-1700ms
- **First Contentful Paint**: <1.5s

### Optimization Techniques
- Server-side rendering for initial page load
- Efficient vector search with top K filtering
- Context-aware prompt engineering
- **Real-time Streaming** - Optional streaming responses for faster perceived performance
- Stream-optimized component updates with live cursor

## 🔄 Development Journey

### Week 2: Python CLI Development
- Local RAG system with Python
- Vector embeddings and semantic search
- LLM integration basics

### Week 3: Cloud System
- Upstash Vector Database setup
- Groq API integration
- Cloud-based vector search

### Week 4: Web Application
- Converted CLI → Modern Web UI
- AI-assisted development with v0.dev
- Professional deployment on Vercel
- Full-stack optimization

### Week 5: Advanced Features
- Added real-time performance metrics tracking
- Implemented streaming responses with Vercel AI SDK
- Toggle between streaming and non-streaming modes
- Enhanced UI with live metrics display

## 📝 Usage Examples

### Example 1: Tropical Fruits
```
Question: "What fruits are popular in tropical regions?"

Response: AI provides detailed answer about tropical fruits
Sources:
- [1] Mango: Popular tropical fruit from India and Southeast Asia...
- [2] Coconut: Widely grown in tropical regions...
- [3] Pineapple: Originated in South America, now grown in Hawaii...
```

### Example 2: Spicy Foods
```
Question: "Tell me about spicy foods and their origins"

Response: Comprehensive answer about capsaicin and hot cuisines
Sources:
- [1] Chili Peppers: Native to Americas...
- [2] Thai Cuisine: Known for spicy dishes...
- [3] Indian Curry: Uses various spices for heat...
```

## 🎯 Key Achievements

✅ **Fully Functional RAG System** - Vector search + LLM generation working seamlessly  
✅ **Real-Time Streaming** - Optional streaming responses with live text updates  
✅ **Performance Metrics** - Track vector search, LLM processing, and total response times  
✅ **Persistent Chat Memory** - Conversations auto-saved with localStorage  
✅ **Multi-Conversation Support** - Manage multiple independent chat threads  
✅ **Professional Web Interface** - Modern, responsive design with smooth interactions  
✅ **AI-Assisted Development** - Built using v0.dev for rapid, high-quality development  
✅ **Cloud Deployment** - Live on Vercel, accessible worldwide  
✅ **Production-Ready** - Error handling, loading states, optimized performance  
✅ **Type-Safe Code** - Full TypeScript implementation  
✅ **Portfolio Quality** - Professional UI/UX suitable for employer/client showcase  

## 📚 Food Knowledge Base

The application connects to a comprehensive food knowledge database including:
- **35+ Food Items** - Diverse cuisines and ingredients
- **Categories** - Fruits, vegetables, proteins, spices, cuisines
- **Origins** - Geographic and cultural information
- **Descriptions** - Detailed metadata for each item
- **Semantic Coverage** - Rich embeddings for semantic search

## 🐛 Error Handling

The application includes robust error handling:
- Network error recovery suggestions
- Loading state management
- User-friendly error messages
- Graceful degradation

## 🔐 Security

- Environment variables kept secure via Vercel
- Server-side API calls (no exposed tokens in frontend)
- Input validation and sanitization
- CORS-protected API endpoints

## 📞 Support & Contact

**Developer**: Aleeya Ahmad  
**GitHub**: [food-rag-web-app-aleeyaahmad](https://github.com/aleeya-ahmads-projects/food-rag-web-app-aleeyaahmad)  
**Status**: Production ✅

## 📄 License

This project is part of an educational portfolio. Use with attribution.

---

**Built with ❤️ using v0.dev, Next.js, and Vercel**