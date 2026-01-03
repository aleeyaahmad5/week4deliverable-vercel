# Food RAG Web Application 🍽️

**AI-Powered Retrieval Augmented Generation System for Food Knowledge Discovery**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/aleeya-ahmads-projects/food-rag-web-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

## 📋 Project Overview

This is a professional full-stack web application that transforms a Python CLI RAG (Retrieval Augmented Generation) system into a modern, responsive web interface. It demonstrates the complete AI development journey:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 2: Local Python RAG          Week 3: Cloud Migration                   │
│  ┌─────────────────────┐           ┌─────────────────────┐                  │
│  │ ChromaDB + Ollama   │    →      │ Upstash + Groq      │                  │
│  │ ~24 seconds/query   │           │ ~0.8 seconds/query  │                  │
│  │ 90 food items       │           │ 110 food items      │                  │
│  └─────────────────────┘           └─────────────────────┘                  │
│                                              │                               │
│                                              ▼                               │
│                               Week 4-5: Web Application                      │
│                              ┌─────────────────────────┐                    │
│                              │ Next.js + Vercel        │                    │
│                              │ Real-time streaming     │                    │
│                              │ Production-ready UI     │                    │
│                              └─────────────────────────┘                    │
│                                                                              │
│                         🚀 29.4x FASTER (Cloud vs Local) 🚀                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

The application leverages **AI-assisted development** using v0.dev to build a sophisticated food knowledge assistant with real-time semantic search and LLM-powered responses.

### Key Features
- ✨ **AI-Powered Chat Interface** - Ask questions about food, cuisines, and cooking
- 🔍 **Semantic Search** - Vector-based similarity search using Upstash Vector Database
- 🧠 **LLM Integration** - Groq API for intelligent response generation  
- � **Model Selection** - Choose between Llama 3.1 8B (fast) or 70B (versatile)
- �📊 **Source Attribution** - See relevant sources with relevance scores
- 💾 **Conversation History** - Persistent chat memory with localStorage auto-save
- 🎨 **Professional UI/UX** - Modern, responsive design with dark mode support
- ⚡ **Real-time Streaming** - Stream AI responses in real-time with toggle option
- 📈 **Performance Metrics** - Track vector search time, LLM processing time, and token usage
- 📱 **Mobile-Optimized** - Fully responsive design for all devices

## 🚀 Live Demo

**[🌐 Visit the Live Application](https://v0-week4deliverable-vercel.vercel.app/)**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-success?style=for-the-badge&logo=vercel)](https://v0-week4deliverable-vercel.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/aleeyaahmad5/food-rag-web-app-aleeyaahmad)

### 💡 Example Queries to Try
| Category | Example Question |
|----------|------------------|
| 🍎 **Fruits** | "What fruits are popular in tropical regions?" |
| 🌶️ **Spicy Foods** | "Tell me about spicy foods and their origins" |
| 🥗 **Healthy Options** | "What are some healthy vegetable options?" |
| 🍳 **Cuisines** | "What makes different cuisines unique?" |
| 🇵🇰 **Pakistani Food** | "Tell me about traditional Lahori dishes" |
| 🥘 **Cooking Methods** | "What dishes can be grilled or barbecued?" |

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
├── app/                        # 🌐 Next.js Web Application (Week 4-5)
│   ├── actions.ts              # Server actions for RAG queries
│   ├── api/chat/route.ts       # Streaming API endpoint
│   ├── layout.tsx              # Root layout with theme setup
│   ├── page.tsx                # Home page component
│   └── globals.css             # Global styles
├── components/                 # 🎨 React UI Components
│   ├── food-chat.tsx           # Main chat interface
│   ├── header.tsx              # Header with branding
│   ├── footer.tsx              # Footer section
│   ├── particle-background.tsx # Background effects
│   ├── theme-provider.tsx      # Dark/light mode
│   └── ui/                     # Shadcn UI components
├── docs/                       # 📚 Documentation
│   ├── ARCHITECTURE.md         # System architecture & design
│   ├── API.md                  # API reference documentation
│   └── DEVELOPMENT.md          # Developer setup guide
├── python-reference/           # 🐍 Python RAG Systems (Week 2-3)
│   ├── README.md               # Cloud migration showcase
│   ├── rag_system.py           # Python RAG implementation
│   ├── seed_data.py            # Database seeder script
│   ├── local-version/          # 📦 Week 2: ChromaDB + Ollama
│   │   ├── rag_run.py          # Local RAG implementation
│   │   ├── foods.json          # 90-item food database
│   │   ├── local_baseline.json # Performance measurements
│   │   └── README.md           # Local version documentation
│   ├── cloud-version/          # ☁️ Week 3: Upstash + Groq (29.4x faster)
│   │   ├── rag_run.py          # Cloud RAG implementation
│   │   ├── test_queries.py     # 15-query test suite
│   │   ├── foods.json          # Enhanced 110-item database
│   │   ├── TEST_RESULTS.md     # Performance comparison report
│   │   └── requirements.txt    # Cloud dependencies
│   ├── data/foods.json         # Shared enhanced food database
│   └── docs/                   # Migration documentation
│       ├── MIGRATION_PLAN.md   # AI-assisted migration planning
│       └── TEST_RESULTS.md     # Performance comparison report
├── lib/utils.ts                # Utility functions
├── public/                     # Static assets
└── [config files]              # Next.js, TypeScript, Tailwind configs
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

- **Models Available**:
  - `llama-3.1-8b-instant` - Fast responses, optimized for speed
  - `llama-3.1-70b-versatile` - More capable, better for complex queries
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

### Week 2: Local Python RAG System (ChromaDB + Ollama)
- Built foundational RAG system with 90 food items
- **Vector Database:** ChromaDB with local SQLite storage
- **Embeddings:** Ollama mxbai-embed-large (manual generation)
- **LLM:** Ollama llama3.2 (local inference)
- **Performance:** ~23.7 seconds per query
- Added 15 culturally diverse food items (Pakistani heritage, healthy nutrition, international cooking)
- Comprehensive testing with 15 queries across 5 categories (100% success rate)

### Week 3: Cloud Migration (Upstash + Groq) - **29.4x Faster!**
- **Vector Database:** Migrated to Upstash Vector (serverless, auto-embedding)
- **LLM:** Switched to Groq llama-3.1-8b-instant (LPU inference)
- **Performance:** ~0.8 seconds per query (96.6% improvement)
- Expanded database to 110 diverse food items
- Created comprehensive migration documentation
- AI-assisted migration planning with detailed architecture decisions

| Metric | Local (Week 2) | Cloud (Week 3) | Improvement |
|--------|---------------|----------------|-------------|
| Embedding + Retrieval | 2,196ms | 259ms | **+88.2%** |
| LLM Generation | 21,493ms | 547ms | **+97.5%** |
| **Total Response** | **23,691ms** | **806ms** | **+96.6%** |

### Week 4: Web Application (Next.js + Vercel)
- Converted CLI → Modern Web UI using v0.dev
- Implemented server actions and API routes
- Professional deployment on Vercel
- Full-stack TypeScript optimization

### Week 5: Advanced Features & Polish
- Real-time performance metrics tracking
- Streaming responses with Vercel AI SDK
- Model selection (Llama 3.1 8B vs 70B)
- Conversation history with localStorage persistence
- Social sharing integration
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
✅ **Model Selection** - Choose between fast (8B) and smart (70B) Llama models  
✅ **Real-Time Streaming** - Optional streaming responses with live text updates  
✅ **Performance Metrics** - Track vector search, LLM processing, and total response times  
✅ **Persistent Chat Memory** - Conversations auto-saved with localStorage  
✅ **Multi-Conversation Support** - Manage multiple independent chat threads  
✅ **Social Sharing** - Share interesting food discoveries on Twitter, Facebook, LinkedIn  
✅ **Professional Web Interface** - Modern, responsive design with smooth interactions  
✅ **AI-Assisted Development** - Built using v0.dev for rapid, high-quality development  
✅ **Cloud Deployment** - Live on Vercel, accessible worldwide  
✅ **Production-Ready** - Error handling, loading states, optimized performance  
✅ **Type-Safe Code** - Full TypeScript implementation  
✅ **Comprehensive Documentation** - Architecture, API, and development guides  
✅ **Portfolio Quality** - Professional UI/UX suitable for employer/client showcase  

---

## 📋 AI Week 4 Deliverables Checklist

### ✅ PART 1: AI-Powered Web Application Development
| Requirement | Status | Details |
|-------------|--------|--------|
| v0.dev account setup | ✅ Complete | AI-assisted UI generation |
| Week 3 Python code as reference | ✅ Complete | `/python-reference` folder |
| Next.js 15+ with Server Actions | ✅ Complete | App Router architecture |
| Shadcn UI + TypeScript | ✅ Complete | Professional component library |
| Chat-like interface | ✅ Complete | Full conversation history |
| Model selection dropdown | ✅ Complete | Llama 3.1 8B/70B |
| Vector search results display | ✅ Complete | Sources with relevance scores |
| LLM-generated responses | ✅ Complete | Contextual AI answers |
| Loading states | ✅ Complete | Animated indicators |
| Error handling | ✅ Complete | User-friendly messages |
| Mobile-responsive design | ✅ Complete | Full mobile optimization |

### ✅ PART 2: Professional Deployment & Access
| Requirement | Status | Details |
|-------------|--------|--------|
| Vercel deployment | ✅ Complete | [Live URL](https://v0-week4deliverable-vercel.vercel.app/) |
| GitHub repository | ✅ Complete | [Repository](https://github.com/aleeyaahmad5/food-rag-web-app-aleeyaahmad) |
| Environment variables synced | ✅ Complete | Upstash + Groq configured |
| Public accessibility | ✅ Complete | Worldwide access |

### ✅ PART 3: Advanced Features & Enhancement
| Feature | Status | Implementation |
|---------|--------|----------------|
| Conversation history | ✅ Complete | localStorage persistence |
| Query suggestions | ✅ Complete | Example questions on welcome |
| Social sharing | ✅ Complete | Twitter, Facebook, LinkedIn, Copy |
| Performance metrics | ✅ Complete | Real-time dashboard per response |
| Streaming responses | ✅ Complete | Toggle on/off with Vercel AI SDK |

### ✅ PART 4: Professional Portfolio Documentation
| Document | Status | Location |
|----------|--------|----------|
| Comprehensive README | ✅ Complete | [README.md](README.md) |
| Architecture documentation | ✅ Complete | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| API documentation | ✅ Complete | [docs/API.md](docs/API.md) |
| Development guide | ✅ Complete | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Python reference (Week 2-3) | ✅ Complete | [python-reference/](python-reference/) |
| Migration documentation | ✅ Complete | [python-reference/docs/](python-reference/docs/) |  

## 📚 Documentation

For detailed documentation, see the `/docs` folder:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, and component architecture |
| [API.md](docs/API.md) | Complete API reference with examples |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Setup instructions and development guide |

### Python Reference (Weeks 2-3)

The `/python-reference` folder contains the complete Python RAG development journey:

#### Local Version (Week 2) - ChromaDB + Ollama
| File | Description |
|------|-------------|
| [local-version/rag_run.py](python-reference/local-version/rag_run.py) | Local RAG with ChromaDB |
| [local-version/foods.json](python-reference/local-version/foods.json) | Original 90-item database |
| [local-version/README.md](python-reference/local-version/README.md) | Detailed local system documentation |

#### Cloud Version (Week 3) - Upstash + Groq (29.4x Faster)
| File | Description |
|------|-------------|
| [cloud-version/rag_run.py](python-reference/cloud-version/rag_run.py) | Cloud-migrated RAG implementation |
| [cloud-version/test_queries.py](python-reference/cloud-version/test_queries.py) | 15-query performance test suite |
| [cloud-version/foods.json](python-reference/cloud-version/foods.json) | Enhanced 110-item database |
| [cloud-version/TEST_RESULTS.md](python-reference/cloud-version/TEST_RESULTS.md) | Performance comparison report |

#### Migration Documentation
| File | Description |
|------|-------------|
| [docs/MIGRATION_PLAN.md](python-reference/docs/MIGRATION_PLAN.md) | AI-assisted migration planning |
| [README.md](python-reference/README.md) | Cloud migration showcase & overview |  

## 📚 Food Knowledge Base

The application connects to an enhanced food knowledge database built during Weeks 2-3:

### Database Evolution
| Version | Items | Added Categories |
|---------|-------|------------------|
| Week 2 (Local) | 90 items | Base 75 + 15 new cultural items |
| Week 3 (Cloud) | 110 items | + 20 globally diverse additions |

### Database Composition (110 Items)
| Category | Count | Examples |
|----------|-------|----------|
| **Pakistani/Lahore Heritage** | 15+ | Haleem, Karahi Gosht, Seekh Kebab, Paya Gosht |
| **Mediterranean** | 10+ | Greek Salad, Hummus, Falafel, Tabbouleh |
| **Asian Cuisines** | 15+ | Laksa, Pad Thai, Bibimbap, Tom Yum |
| **Health-Conscious** | 15+ | Grilled Salmon, Quinoa Bowls, Vegan options |
| **International Cooking** | 10+ | Risotto, Coq au Vin, Paella |
| **Comfort Foods** | 10+ | Mac & Cheese, Ramen, Tacos |

### Each Item Includes
- ✅ Comprehensive description (75+ words)
- ✅ Cooking methods and preparation techniques
- ✅ Nutritional information and health benefits
- ✅ Cultural background and regional variations
- ✅ Dietary tags (vegan, gluten-free, etc.)
- ✅ Allergen information

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
**Location**: Melbourne, Australia  
**GitHub**: [aleeyaahmad5/food-rag-web-app-aleeyaahmad](https://github.com/aleeyaahmad5/food-rag-web-app-aleeyaahmad)  
**Live Demo**: [v0-week4deliverable-vercel.vercel.app](https://v0-week4deliverable-vercel.vercel.app/)  
**Status**: Production ✅ | Portfolio Ready ✅

## 📄 License

This project is part of an educational portfolio. Use with attribution.

---

**Built with ❤️ by Aleeya Ahmad using v0.dev, Next.js, and Vercel**

*Last Updated: January 4, 2026 | AI Week 4 Deliverables Complete ✅*