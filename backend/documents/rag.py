import os
import fitz
import docx
import chromadb
from chromadb.config import Settings
from django.conf import settings
from openai import OpenAI

# Initialize OpenAI
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Initialize ChromaDB with telemetry disabled
chroma_client = chromadb.PersistentClient(
    path=settings.CHROMA_DB_PATH,
    settings=Settings(anonymized_telemetry=False)
)

def extract_text(file_path: str) -> str:
    """Read text from PDF or DOCX file"""
    text = ""

    if file_path.endswith('.pdf'):
        # Open PDF and read all pages
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()

    elif file_path.endswith('.docx'):
        # Open Word file and read all paragraphs
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"

    elif file_path.endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

    return text.strip()


def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """
    Split big text into smaller overlapping pieces.
    
    Example: If chunk_size=500 and overlap=50,
    chunk1 = characters 0-500
    chunk2 = characters 450-950  (50 char overlap with chunk1)
    chunk3 = characters 900-1400
    
    Overlap helps so no information is lost at chunk boundaries.
    """
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():  # skip empty chunks
            chunks.append(chunk)
        start = end - overlap  # move back by overlap amount

    return chunks


def get_embedding(text: str) -> list:
    """Convert text into a list of numbers (embedding vector) using OpenAI"""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def process_document(document_id: int, file_path: str):
    """
    Full pipeline:
    1. Extract text from file
    2. Split into chunks
    3. Embed each chunk
    4. Store in ChromaDB
    """
    # Step 1: Extract text
    text = extract_text(file_path)
    if not text:
        raise ValueError("Could not extract text from file")

    # Step 2: Split into chunks
    chunks = split_into_chunks(text)

    # Step 3 & 4: Embed and store in ChromaDB
    # Each document gets its own "collection" in ChromaDB
    collection_name = f"document_{document_id}"
    
    # Delete old collection if re-processing
    try:
        chroma_client.delete_collection(collection_name)
    except:
        pass

    collection = chroma_client.create_collection(collection_name)

    # Process each chunk
    embeddings = []
    documents = []
    ids = []

    for i, chunk in enumerate(chunks):
        embedding = get_embedding(chunk)
        embeddings.append(embedding)
        documents.append(chunk)
        ids.append(f"chunk_{i}")

    # Store everything in ChromaDB at once
    collection.add(
        embeddings=embeddings,
        documents=documents,
        ids=ids
    )

    return len(chunks)


def retrieve_relevant_chunks(document_id: int, query: str, top_k: int = 4) -> list:
    """
    Find the most relevant chunks for a user's question.
    
    1. Embed the user's question
    2. Search ChromaDB for similar chunks
    3. Return the top_k most similar ones
    """
    collection_name = f"document_{document_id}"
    collection = chroma_client.get_collection(collection_name)

    # Embed the question
    query_embedding = get_embedding(query)

    # Search for similar chunks
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results['documents'][0]  # list of chunk texts


def generate_answer(query: str, context_chunks: list, chat_history: list) -> str:
    """
    Send the question + relevant document chunks to GPT-4o
    and get an answer.
    """
    # Combine all relevant chunks into one context block
    context = "\n\n---\n\n".join(context_chunks)

    # System prompt tells GPT how to behave
    system_prompt = f"""You are a helpful assistant that answers questions based on the provided document.

Use ONLY the information from the document context below to answer questions.
If the answer is not in the context, say "I couldn't find that information in the document."
Be clear, concise, and helpful.

DOCUMENT CONTEXT:
{context}
"""

    # Build messages list (includes chat history for memory)
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add previous messages so GPT remembers the conversation
    for msg in chat_history[-6:]:  # last 6 messages only (3 exchanges)
        messages.append({"role": msg['role'], "content": msg['content']})

    # Add the current question
    messages.append({"role": "user", "content": query})

    # Call GPT-4o
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # cheaper version, still very good
        messages=messages,
        temperature=0.3,  # lower = more factual, less creative
    )

    return response.choices[0].message.content