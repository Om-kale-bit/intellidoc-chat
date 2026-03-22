# DocChat AI — RAG Document Chatbot

A full-stack AI chatbot that lets you upload documents (PDF, DOCX, TXT) 
and ask questions about them using Retrieval-Augmented Generation (RAG).

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Python, Django, Django REST Framework
- **AI/RAG:** OpenAI GPT-4o-mini, text-embedding-3-small, ChromaDB
- **Database:** SQLite (dev), ChromaDB (vector store)

## Features

- Upload PDF, DOCX, or TXT documents
- Automatic text extraction, chunking, and embedding
- Semantic search using vector similarity
- Context-aware answers using GPT-4o-mini
- Multi-turn chat memory per session
- Clean React UI with drag-and-drop upload

## How It Works

1. User uploads a document
2. Backend parses and splits text into chunks
3. Each chunk is embedded using OpenAI embeddings
4. Embeddings stored in ChromaDB vector database
5. User asks a question
6. Question is embedded and matched to relevant chunks
7. GPT-4o-mini answers using only the document context

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # add your OpenAI API key
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the `backend/` folder:
```
OPENAI_API_KEY=your-openai-api-key-here
SECRET_KEY=your-django-secret-key
DEBUG=True
```