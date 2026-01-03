# System Architecture

## Overview

The Food RAG Web Application is a full-stack AI-powered system that combines vector-based semantic search with Large Language Model (LLM) generation to provide intelligent responses about food-related queries.

## Architecture Evolution

This project evolved through three phases, each demonstrating significant architectural improvements:

### Phase 1: Local System (Week 2)
```
foods.json → Ollama mxbai-embed-large → ChromaDB → Ollama llama3.2
   (90)         (LOCAL ~2.2s)           (LOCAL)      (LOCAL ~21s)
                        
              Average Response Time: 23,691ms (~24 seconds)
```

### Phase 2: Cloud Migration (Week 3)
```
foods.json → Upstash Vector (auto-embed) → Groq Cloud llama-3.1-8b
  (110)         (CLOUD ~259ms)                (CLOUD ~547ms)
                        
              Average Response Time: 806ms (<1 second)
                      🚀 29.4x FASTER! 🚀
```

### Phase 3: Web Application (Weeks 4-5)
```
Next.js UI → Server Actions/API → Upstash Vector → Groq API → Streaming UI
                                     
              Production-ready with real-time streaming responses
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE (Next.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Chat Input │  │  Response   │  │   Sources   │  │ Performance Metrics │ │
│  │   + Send    │  │   Display   │  │   Display   │  │     Dashboard       │ │
│  └──────┬──────┘  └──────▲──────┘  └──────▲──────┘  └──────────▲──────────┘ │
│         │                │                │                     │           │
└─────────┼────────────────┼────────────────┼─────────────────────┼───────────┘
          │                │                │                     │
          ▼                │                │                     │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js Server Actions                            │   │
│  │  ┌─────────────────┐            ┌─────────────────────────────────┐  │   │
│  │  │ ragQuery()      │            │ /api/chat (Streaming)           │  │   │
│  │  │ - Non-streaming │            │ - Real-time text streaming      │  │   │
│  │  │ - Full response │            │ - Vercel AI SDK integration     │  │   │
│  │  └────────┬────────┘            └────────────────┬────────────────┘  │   │
│  │           │                                      │                    │   │
│  └───────────┼──────────────────────────────────────┼────────────────────┘   │
└──────────────┼──────────────────────────────────────┼────────────────────────┘
               │                                      │
               ▼                                      ▼
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│       VECTOR DATABASE            │    │          LLM SERVICE             │
│      (Upstash Vector)            │    │          (Groq API)              │
│  ┌────────────────────────────┐  │    │  ┌────────────────────────────┐  │
│  │  • Semantic Search         │  │    │  │  • llama-3.1-8b-instant    │  │
│  │  • Text Embeddings         │  │    │  │  • Temperature: 0.7        │  │
│  │  • TopK: 3 Results         │  │    │  │  • Max Tokens: 500         │  │
│  │  • Metadata Storage        │  │    │  │  • Streaming Support       │  │
│  └────────────────────────────┘  │    └────────────────────────────────┘  │
│                                  │    │                                  │
│  Data Structure:                 │    │  System Prompt:                  │
│  {                               │    │  "You are a helpful food         │
│    id: string,                   │    │   knowledge assistant..."        │
│    vector: number[],             │    │                                  │
│    metadata: {                   │    │  Context Window:                 │
│      text: string,               │    │  [1] Source 1 text...            │
│      category: string,           │    │  [2] Source 2 text...            │
│      origin: string              │    │  [3] Source 3 text...            │
│    }                             │    │                                  │
│  }                               │    │                                  │
└──────────────────────────────────┘    └──────────────────────────────────┘
```

## Data Flow

### 1. User Query Flow

```
User Input → Next.js Client → Server Action/API → Vector Search → LLM → Response
```

### 2. Detailed Process

1. **User Input**: User types a food-related question
2. **Client Processing**: React component captures input and triggers request
3. **Server Action**: `ragQuery()` or `/api/chat` receives the question
4. **Vector Search**: 
   - Question converted to embeddings by Upstash
   - Semantic similarity search performed
   - Top 3 most relevant documents retrieved
5. **Context Building**: 
   - Retrieved documents formatted as numbered context
   - Metadata extracted (category, origin)
6. **LLM Processing**:
   - System prompt + context + question sent to Groq
   - LLM generates contextual response
7. **Response Delivery**:
   - Answer returned with sources and metrics
   - UI updates with response

## Component Architecture

### Frontend Components

```
components/
├── food-chat.tsx       # Main chat interface
│   ├── Message Display
│   ├── Source Cards
│   ├── Metrics Dashboard
│   ├── Streaming Toggle
│   └── Share Buttons
├── header.tsx          # Navigation & theme toggle
├── footer.tsx          # Footer links
├── particle-background.tsx  # Visual effects
├── theme-provider.tsx  # Dark/light mode
└── ui/                 # Shadcn components
```

### Backend Services

```
app/
├── actions.ts          # Server action (non-streaming)
│   └── ragQuery()
├── api/
│   └── chat/
│       └── route.ts    # Streaming API endpoint
└── page.tsx            # Main page component
```

## Performance Metrics

The system tracks and displays:

| Metric | Description | Typical Range |
|--------|-------------|---------------|
| Vector Search Time | Time for Upstash query | 100-200ms |
| LLM Processing Time | Groq API response time | 500-1500ms |
| Total Response Time | End-to-end latency | 600-1700ms |
| Tokens Used | LLM tokens consumed | 200-600 |

## Streaming vs Non-Streaming

| Feature | Non-Streaming | Streaming |
|---------|---------------|-----------|
| Response Delivery | Full response at once | Character by character |
| Perceived Performance | Slower (wait for full) | Faster (immediate feedback) |
| Implementation | Server Action | API Route + AI SDK |
| User Experience | Simple | More engaging |

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge                       │
│  ┌───────────────────────────────────────────────┐  │
│  │              Environment Variables             │  │
│  │  • UPSTASH_VECTOR_REST_URL                    │  │
│  │  • UPSTASH_VECTOR_REST_TOKEN                  │  │
│  │  • GROQ_API_KEY                               │  │
│  └───────────────────────────────────────────────┘  │
│                         │                            │
│                    Server-Side                       │
│                    API Calls                         │
│                         │                            │
│                         ▼                            │
│  ┌───────────────────────────────────────────────┐  │
│  │               Client (Browser)                 │  │
│  │        No API keys or tokens exposed          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15, React 19 | UI framework |
| Styling | Tailwind CSS, Shadcn UI | Design system |
| Backend | Next.js Server Actions | API logic |
| Vector DB | Upstash Vector | Semantic search |
| LLM | Groq (llama-3.1-8b) | Response generation |
| Streaming | Vercel AI SDK | Real-time responses |
| Deployment | Vercel | Hosting & edge |
| State | localStorage | Chat persistence |

## Performance Comparison: Local vs Cloud

The migration from local to cloud infrastructure achieved significant performance improvements:

| Metric | Local (Week 2) | Cloud (Week 3) | Improvement |
|--------|----------------|----------------|-------------|
| Embedding + Retrieval | 2,196ms | 259ms | **+88.2%** |
| LLM Generation | 21,493ms | 547ms | **+97.5%** |
| **Total Response** | **23,691ms** | **806ms** | **+96.6%** |

### Key Migration Changes

| Component | Before (Local) | After (Cloud) |
|-----------|---------------|---------------|
| **Vector Database** | ChromaDB (local SQLite) | Upstash Vector (serverless) |
| **Embeddings** | Ollama mxbai-embed-large (manual) | Upstash built-in (automatic) |
| **LLM** | Ollama llama3.2 (local) | Groq llama-3.1-8b-instant (cloud) |
| **Food Database** | 90 items | 110 items |
| **Infrastructure** | Local machine required | Serverless, auto-scaling |

For detailed migration documentation, see [python-reference/docs/MIGRATION_PLAN.md](../python-reference/docs/MIGRATION_PLAN.md).
