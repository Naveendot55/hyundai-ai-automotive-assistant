# Hyundai AI Automotive Assistant

> **Production-grade Retrieval-Augmented Generation (RAG) Automotive Intelligence System for Hyundai Motor India.**  
> Built with **React 18**, **Node.js**, **Express.js**, **MongoDB Atlas Vector Search**, and **Google Gemini API**.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Core Architecture & Technical Stack](#-core-architecture--technical-stack)
3. [The 4 Required Automotive AI Capabilities](#-the-4-required-automotive-ai-capabilities)
4. [RAG Pipeline & MongoDB Vector Search](#-rag-pipeline--mongodb-vector-search)
5. [Database Architecture](#-database-architecture)
6. [Atlas Vector Search Index Configuration](#-atlas-vector-search-index-configuration)
7. [Installation & Local Setup](#-installation--local-setup)
8. [Environment Variables](#-environment-variables)
9. [Automated Test Suite](#-automated-test-suite)
10. [REST API Documentation](#-rest-api-documentation)
11. [Deployment Guide (Vercel & Render)](#-deployment-guide-vercel--render)

---

## 🌟 Project Overview

The **Hyundai AI Automotive Assistant** is a technical assignment project engineered for **Cyepro Solutions**. It transforms static vehicle brochures (PDF format) into structured, queryable knowledge vectors, allowing automotive buyers and sales consultants to query technical specifications with **guaranteed factual accuracy**.

### 🚫 The Grounding Guarantee: Zero Hallucinations
- Vehicle specifications are **never invented or assumed**.
- Factual claims are strictly grounded in retrieved brochure excerpts.
- Missing or undocumented specifications are explicitly disclosed.
- Every AI response contains transparent **source citations** including document name, vehicle model, page number, and vector relevance score.

---

## 🛠️ Core Architecture & Technical Stack

```
[ Frontend: React 18 + Vite + Tailwind CSS ]
                     │  (JWT Authenticated REST APIs)
                     ▼
[ Backend: Node.js + Express.js MVC ]
         │                        │
         ▼                        ▼
[ Ingestion Pipeline ]      [ RAG Retrieval Engine ]
   • Multer (PDF Upload)       • Query Embedding (gemini-embedding-001)
   • pdf-parse (Text & Pager)  • MongoDB Atlas ($vectorSearch)
   • Semantic Chunking (800c)  • Multi-Brochure Ranking
   • Gemini Embeddings (768d)  • Grounded Gemini Prompting (gemini-3.1-flash-lite)
         │                        │
         └───────────┬────────────┘
                     ▼
[ Database: MongoDB Atlas ]
   • Users (bcrypt + JWT)
   • Documents (metadata & statuses)
   • DocumentChunks (768-dim embeddings + indexes)
   • ChatHistory (conversations & citations)
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v7, Axios, Lucide React, React Markdown, Remark GFM |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose, Multer, `pdf-parse`, `pdf-lib`, `bcryptjs`, `jsonwebtoken` |
| **AI & Embeddings**| Google Gemini API (`@google/generative-ai`), `gemini-embedding-001` (768-dim), `gemini-3.1-flash-lite-preview` / `gemini-3.1-flash-lite` |
| **Vector Storage** | MongoDB Atlas Vector Search (`$vectorSearch` aggregation) with Cosine engine fallback |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service), MongoDB Atlas (Database Cluster) |

---

## 🎯 The 4 Required Automotive AI Capabilities

### 🚗 Capability A: Hyundai Alcazar Features
- Categorizes features under structured headings:
  - **Engine specifications** (1.5 Turbo GDi 160 PS / 253 Nm vs 1.5 Diesel 116 PS / 250 Nm)
  - **Safety features** (6 standard airbags, ESC, VSM, HAC, 4-wheel disc brakes)
  - **Comfort features** (Panoramic sunroof, 2nd-row captain seats, ventilated seats)
  - **Technology features** (Dual 10.25" screens, Bose 8-speaker audio, SmartSense ADAS)
  - **Interior / Exterior / Performance**
- Unsupported categories explicitly return: *"Not specified in uploaded brochure"*.

### ⚖️ Capability B: Alcazar vs Creta Comparison
- Dual-brochure retrieval: extracts excerpts from both `Hyundai Alcazar` and `Hyundai Creta` brochures.
- Generates structured comparison tables across:
  - Engine & Transmission options
  - Performance outputs
  - Safety systems
  - Cabin dimensions & Seating capacity (6/7-seater vs 5-seater)
  - Luggage boot space

### 🏷️ Capability C: Alcazar Variant Comparison
- Compares trim tiers: **Prestige** (entry), **Platinum** (mid-level), and **Signature** (top-tier ADAS flagship).
- Analyzes powertrain options, standard vs optional equipment, wheel sizes, and tech packages.

### 🧭 Capability D: i20 vs Aura Customer-Centric Recommendations
- Evaluates customer requirements:
  - Daily city commuting vs long-distance highway road trips
  - Boot space requirements (i20 311 L vs Aura 402 L dedicated sedan trunk)
  - Fuel economy & CNG availability (Aura 1.2 Bi-Fuel CNG)
  - Compact urban manoeuvrability (i20 5.1m turning radius)
- Produces a head-to-head comparison table, advantages of each vehicle, a clear recommendation, and supporting reasons.

---

## 🔄 RAG Pipeline & MongoDB Vector Search

```
User Query
   │
   ▼
[Intent Classifier] ── Detects Capability (A, B, C, D) & Target Models
   │
   ▼
[Gemini Embedding] ── Generates 768-dim Query Vector (gemini-embedding-001)
   │
   ▼
[MongoDB Atlas] ───── Executes $vectorSearch with vehicleModel filter
   │
   ▼
[Retrieved Chunks] ── Top-k brochure excerpts with page numbers & scores
   │
   ▼
[Prompt Assembler] ── Strict RAG System Prompt + Grounded Context
   │
   ▼
[Google Gemini] ───── Generates response grounded ONLY in brochure facts
   │
   ▼
Frontend Response ─── Formatted Markdown + Verified Source Reference Pills
```

---

## 🗄️ Database Architecture

### 1. `Users` Collection
- `name`: String (trimmed)
- `email`: String (unique, validated)
- `password`: String (bcrypt hashed, cost: 10)
- `role`: String (`user` | `admin`)
- `createdAt`: Date

### 2. `Documents` Collection
- `fileName`: String (stored physical filename)
- `originalName`: String (original user filename)
- `vehicleModel`: String (e.g. `Hyundai Alcazar`, `Hyundai Creta`, `Hyundai i20`, `Hyundai Aura`)
- `storagePath`: String (physical filesystem path)
- `fileSize`: Number (bytes)
- `uploadedBy`: ObjectId (ref: User)
- `processingStatus`: String (`Uploaded` → `Processing` → `Completed` | `Failed`)
- `chunkCount`: Number
- `pageCount`: Number
- `uploadedAt`: Date

### 3. `DocumentChunks` Collection
- `documentId`: ObjectId (ref: Document, indexed)
- `vehicleModel`: String (indexed)
- `content`: String (clean semantic chunk)
- `pageNumber`: Number
- `chunkIndex`: Number
- `embedding`: [Number] (768-dimensional vector)
- `metadata`: Object (`{ fileName, charCount, pageNumber }`)

### 4. `ChatHistory` Collection
- `userId`: ObjectId (ref: User, indexed)
- `title`: String
- `messages`: Array of:
  - `role`: `user` | `assistant`
  - `content`: String
  - `capability`: String
  - `sources`: Array of `{ documentName, vehicleModel, pageNumber, chunkText, relevanceScore }`
  - `timestamp`: Date

---

## 🔍 Atlas Vector Search Index Configuration

When configuring your collection on **MongoDB Atlas**, create a Vector Search Index on the `documentchunks` collection with the following definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "vehicleModel"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

*Index Name:* `vector_index`

> **Note:** The backend contains an automatic, zero-configuration local Vector Search engine (calculating exact cosine similarity over candidate model chunks) so that tests, unit runs, and local environments work seamlessly even before an Atlas index is provisioned.

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js >= 18.0.0 (v20+ recommended)
- MongoDB running locally on port 27017 or a MongoDB Atlas connection string
- (Optional) Google Gemini API Key from Google AI Studio

### Step 1: Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-username/hyundai-ai-automotive-assistant.git
cd hyundai-ai-automotive-assistant

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hyundai_ai_db
JWT_SECRET=hyundai_secret_jwt_key_2026_cyepro_solutions
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
EMBEDDING_MODEL=gemini-embedding-001
GENERATIVE_MODEL=gemini-3.1-flash-lite-preview
EMBEDDING_DIMENSIONS=768
MAX_FILE_SIZE_MB=25
```

### Step 3: Seed Sample Hyundai Brochures
Populate the database with official brochures and vector chunks for **Hyundai Alcazar**, **Hyundai Creta**, **Hyundai i20**, and **Hyundai Aura**:
```bash
cd backend
npm run seed
```
*Creates the default specialist account:*
- **Email:** `demo@hyundai-ai.com`
- **Password:** `Hyundai2026!`

### Step 4: Run the Application
In separate terminal tabs:
```bash
# Terminal 1: Start Backend Server (http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Start Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Automated Test Suite

The project includes 6 automated test suites covering 32 distinct assertions across Auth, Document Ingestion, Semantic Chunking, Vector Retrieval, Production Guardrails, and RAG Grounding:

```bash
cd backend
npm test
```

### Test Coverage:
1. `tests/auth.test.js` (7/7): User registration, duplicate email rejection, login authentication, password mismatch rejection, JWT `/me` verification, 401 unauthorized blocking, token tampering prevention.
2. `tests/document.test.js` (5/5): PDF upload via multipart form, text extraction, semantic chunking, page count verification, document listing, cascading chunk deletion.
3. `tests/vectorSearch.test.js` (3/3): 768-dim embedding generation, cosine similarity math, vector top-k retrieval, vehicle model filtering.
4. `tests/e2e.test.js` (8/8): Complete end-to-end verification of all 4 AI capabilities, multi-brochure comparisons, absence handling, and chat history persistence.
5. `tests/productionEnforcement.test.js` (3/3): Production environment strictness ensuring missing API keys or unconfigured Atlas vector search strictly throw rather than falling back.
6. `tests/ragAndCapabilities.test.js` (6/6): Multi-model brochure ingestion, single-model RAG, cross-brochure RAG, variant matrix comparison, customer advisory recommendation, and chat persistence.

---

## 📡 REST API Documentation

### Authentication Endpoints
- `POST /api/auth/register` — Register new user
  ```json
  { "name": "Sales Consultant", "email": "consultant@hyundai.com", "password": "Password123!" }
  ```
- `POST /api/auth/login` — Login & receive JWT token
  ```json
  { "email": "consultant@hyundai.com", "password": "Password123!" }
  ```
- `GET /api/auth/me` *(Protected)* — Get current user profile

### Document Management Endpoints
- `POST /api/documents/upload` *(Protected, Multipart)* — Upload Hyundai PDF brochure
  - Fields: `brochure` (File, PDF), `vehicleModel` (String)
  - Query: `?sync=true` for inline chunking and indexing
- `GET /api/documents` *(Protected)* — List all brochures with chunk counts & status
- `GET /api/documents/:id` *(Protected)* — Get brochure metadata and chunk previews
- `DELETE /api/documents/:id` *(Protected)* — Delete brochure file, record, and all vector chunks

### AI Chat & RAG Endpoints
- `POST /api/chat` *(Protected)* — Submit query to RAG pipeline
  ```json
  {
    "message": "Compare Hyundai Alcazar vs Hyundai Creta across engine and safety.",
    "conversationId": null,
    "vehicleModelFilter": null
  }
  ```
- `GET /api/chat/history` *(Protected)* — List user's conversations
- `GET /api/chat/history?conversationId=...` *(Protected)* — Get full conversation messages & sources
- `DELETE /api/chat/history/:id` *(Protected)* — Delete conversation

---

## 🌐 Deployment Guide (Vercel & Render)

### Frontend Deployment on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Framework Preset: `Vite`.
4. Configure rewrites in `frontend/vercel.json` pointing `/api/(.*)` to your Render backend URL.
5. Deploy.

### Backend Deployment on Render
1. Create a **Web Service** on [Render](https://render.com).
2. Connect your repository.
3. Set Root Directory to `backend` (or use `render.yaml` at root).
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `NODE_ENV=production`.
7. Once deployed, run `npm run seed` to index the default brochures.

---

## 👥 Submission Details

- **Project:** Hyundai AI Automotive Assistant
- **Assignment By:** Cyepro Solutions
- **Stack:** MERN (MongoDB Atlas, Express, React, Node) + Google Gemini RAG
- **Default Demo Account:** `demo@hyundai-ai.com` / `Hyundai2026!`
