# Hyundai AI Automotive Assistant

A Retrieval-Augmented Generation (RAG) based automotive intelligence platform that enables users to interact with Hyundai vehicle brochures and retrieve accurate, source-grounded information.

**Developed as a technical assignment for Cyepro Solutions.**

**Live Application:** https://hyundai-ai-frontend.vercel.app  
**GitHub Repository:** https://github.com/Naveendot55/hyundai-ai-automotive-assistant  
**Backend:** https://hyundai-ai-backend.onrender.com

---

## 1. Project Overview

The Hyundai AI Automotive Assistant transforms Hyundai vehicle brochures in PDF format into searchable knowledge sources using embeddings and MongoDB Atlas Vector Search.

Users can ask questions about vehicle specifications, compare different models, explore variant differences, and receive customer-oriented recommendations.

The application uses a RAG architecture to retrieve relevant brochure excerpts before generating responses through Google Gemini.

### Key Features

- Secure user registration and login using JWT authentication.
- PDF brochure upload and text extraction.
- Semantic document chunking and embedding generation.
- MongoDB Atlas Vector Search.
- AI-powered automotive question answering.
- Multi-vehicle and variant comparisons.
- Source citations with document names and page numbers.
- Conversation history management.
- Explicit handling of information not found in uploaded documents.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| AI Model | Google Gemini API |
| Embeddings | gemini-embedding-001 |
| Vector Search | MongoDB Atlas Vector Search |
| Authentication | JWT, bcryptjs |
| PDF Processing | pdf-parse, pdf-lib |
| API Communication | Axios |
| Deployment | Vercel, Render |

---

## 3. Automotive AI Capabilities

The application implements four core automotive intelligence capabilities.

### A. Hyundai Alcazar Feature Analysis

Provides structured information about:

- Engine specifications.
- Safety features.
- Comfort and convenience.
- Interior and exterior features.
- Technology and infotainment.
- Performance specifications.

### B. Hyundai Alcazar vs Hyundai Creta Comparison

Retrieves information from multiple vehicle brochures and generates structured comparisons covering:

- Engine and transmission.
- Performance.
- Safety.
- Dimensions.
- Seating capacity.
- Available features.

### C. Hyundai Alcazar Variant Comparison

Compares different variants, including:

- Prestige.
- Platinum.
- Signature.

Highlights differences in equipment, technology, safety, and available features based on retrieved brochure information.

### D. Hyundai i20 vs Hyundai Aura Recommendations

Provides customer-oriented recommendations based on requirements such as:

- Daily city commuting.
- Long-distance travel.
- Boot space.
- Fuel options.
- Vehicle dimensions.
- Practicality and convenience.

---

## 4. System Architecture

```text
              FRONTEND
          React + Vite
                |
                | Axios REST API
                | JWT Authentication
                |
                v
              BACKEND
         Node.js + Express
                |
       +--------+---------+
       |                  |
       v                  v
  PDF Ingestion       RAG Engine
       |                  |
  PDF Extraction     Query Embedding
       |                  |
  Text Chunking      Vector Retrieval
       |                  |
  Gemini Embeddings  MongoDB Atlas
       |                  |
       +--------+---------+
                |
                v
         Google Gemini API
                |
                v
       Grounded AI Response
                |
                v
      Frontend with Citations
```

---

## 5. RAG Pipeline

The application follows these steps to generate responses:

1. User submits a question through the frontend.
2. The backend generates an embedding for the query.
3. MongoDB Atlas Vector Search retrieves semantically relevant document chunks.
4. Retrieved brochure excerpts are assembled into the AI prompt.
5. Google Gemini generates a response using the retrieved context.
6. The backend returns the answer along with source references.
7. The frontend displays the response and citations.

### Grounding Strategy

- Responses are based on retrieved brochure information.
- Source references include document names and page numbers.
- Missing information is identified rather than intentionally fabricated.
- Retrieval results help users verify the information behind an answer.

---

## 6. Database Architecture

The application uses MongoDB Atlas with the following collections.

### Users

Stores user account information.

- name
- email
- password (bcrypt hashed)
- role
- createdAt

### Documents

Stores uploaded brochure metadata.

- fileName
- originalName
- vehicleModel
- storagePath
- fileSize
- uploadedBy
- processingStatus
- chunkCount
- pageCount
- uploadedAt

### DocumentChunks

Stores processed brochure content and embeddings.

- documentId
- vehicleModel
- content
- pageNumber
- chunkIndex
- embedding
- metadata

### ChatHistory

Stores user conversations and retrieved source references.

- userId
- title
- messages
- capability
- sources
- timestamp

---

## 7. MongoDB Atlas Vector Search

The project uses a vector index named `vector_index`.

Collection:

`hyundai_ai_db.documentchunks`

Index configuration:

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
    }
  ]
}
```

The vector index enables semantic retrieval of relevant brochure content using 768-dimensional embeddings.

---

## 8. Local Installation

### Prerequisites

- Node.js 18 or higher.
- npm.
- MongoDB Atlas account or local MongoDB.
- Google Gemini API key.

### Step 1: Clone the Repository

```bash
git clone https://github.com/Naveendot55/hyundai-ai-automotive-assistant.git

cd hyundai-ai-automotive-assistant
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

EMBEDDING_MODEL=gemini-embedding-001
GENERATIVE_MODEL=your_supported_gemini_model

EMBEDDING_DIMENSIONS=768
MAX_FILE_SIZE_MB=25
```

Use your own credentials. Never commit actual API keys, database passwords, or JWT secrets to GitHub.

### Step 5: Start the Backend

From the backend directory:

```bash
npm run dev
```

Backend:

`http://localhost:5000`

### Step 6: Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Frontend:

`http://localhost:5173`

---

## 9. Automated Testing

The backend includes six automated test suites.

| Test Suite | Assertions |
|---|---:|
| Authentication | 7 |
| Document Management | 5 |
| Vector Search | 3 |
| End-to-End | 8 |
| Production Enforcement | 3 |
| RAG and Capabilities | 6 |
| **Total** | **32** |

### Run Tests

```bash
cd backend
npm test
```

The test suites cover authentication, document processing, semantic retrieval, RAG capabilities, and production configuration enforcement.

---

## 10. REST API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve authenticated user |

### Document Management

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/documents/upload` | Upload a PDF brochure |
| GET | `/api/documents` | List uploaded brochures |
| GET | `/api/documents/:id` | Retrieve document details |
| DELETE | `/api/documents/:id` | Delete a document |

### AI Chat

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Submit an AI query |
| GET | `/api/chat/history` | Retrieve conversations |
| DELETE | `/api/chat/history/:id` | Delete a conversation |

Protected endpoints require JWT authentication.

---

## 11. Production Deployment

The application is deployed using three services.

### Frontend – Vercel

- Platform: Vercel
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Production environment variable:

```env
VITE_API_URL=https://hyundai-ai-backend.onrender.com/api
```

### Backend – Render

- Platform: Render
- Runtime: Node.js
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Required backend environment variables include:

- MONGODB_URI
- JWT_SECRET
- GEMINI_API_KEY
- NODE_ENV
- JWT_EXPIRES_IN
- EMBEDDING_MODEL
- GENERATIVE_MODEL
- EMBEDDING_DIMENSIONS

### Database – MongoDB Atlas

- Database: `hyundai_ai_db`
- Collections: Users, Documents, DocumentChunks, ChatHistory
- Vector Index: `vector_index`

---

## 12. Production Verification

The deployed application was tested using the production frontend.

| Test | Result |
|---|---|
| Frontend deployment | PASS |
| Backend connectivity | PASS |
| User login | PASS |
| JWT authentication | PASS |
| AI chatbot response | PASS |
| Creta vs Alcazar comparison | PASS |
| Brochure retrieval | PASS |
| Source citations | PASS |
| 360-degree camera information query | PASS |

The live comparison test successfully retrieved information from both vehicle brochures and generated a structured response with six brochure excerpts.

---

## 13. Project Links

**Live Application:**  
https://hyundai-ai-frontend.vercel.app

**GitHub Repository:**  
https://github.com/Naveendot55/hyundai-ai-automotive-assistant

**Backend Service:**  
https://hyundai-ai-backend.onrender.com

---

## 14. Assignment Information

**Project:** Hyundai AI Automotive Assistant  
**Organization:** Cyepro Solutions  
**Architecture:** MERN + Retrieval-Augmented Generation  
**AI Integration:** Google Gemini API  
**Vector Database:** MongoDB Atlas Vector Search  
**Deployment:** Vercel and Render

---

*Developed as a technical assignment demonstrating full-stack development, AI integration, semantic search, document processing, and production deployment.*