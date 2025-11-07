import os
from dotenv import load_dotenv
from google import genai
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from langchain_community.document_loaders import PyMuPDFLoader
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, MessagesState, START

load_dotenv()
GEMINI_API_KEY = os.getenv("API_KEY")
CHROMA_API_KEY = os.getenv("CHROMA_API_KEY") 
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DB = os.getenv("CHROMA_DB", "chatbot")

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Initialize Chroma Cloud client
chroma_client = chromadb.CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_TENANT,
    database=CHROMA_DB
)

# Memory handler for chat sessions
checkpointer = MemorySaver()

# Initialize Sentence Transformer model
st_model = SentenceTransformer("all-MiniLM-L6-v2")  # You can change the model

# Extract text from PDF
def extract_text_from_pdf(file_path):
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    return documents

# Store PDF chunks & embeddings in Chroma Cloud
def store_pdf_data(file_path):
    print("Extracting and embedding PDF content...")
    
    # Extract PDF text
    documents = extract_text_from_pdf(file_path)

    # Split text into overlapping chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)

    # Prepare data
    chunk_texts = [doc.page_content for doc in chunks]
    metadatas = [{"source": file_path} for _ in chunk_texts]
    ids = [f"doc{i}" for i in range(len(chunk_texts))]

    # Generate embeddings with Sentence Transformers
    embeddings_vectors = st_model.encode(chunk_texts, show_progress_bar=True)

    # Get or create collection in Chroma Cloud
    collection = chroma_client.get_or_create_collection(name="novadrive_docs")

    # Add data to collection
    collection.add(
        ids=ids,
        documents=chunk_texts,
        embeddings=embeddings_vectors.tolist(),  # Chroma Cloud expects a list of lists
        metadatas=metadatas
    )

    print(f"Stored {len(chunk_texts)} chunks in Chroma Cloud collection 'novadrive_docs'")

# Retrieve top-matching text chunks
def get_relevant_chunks(query, k=3):
    # Generate embedding for query
    query_vector = st_model.encode([query])[0]

    # Get collection
    collection = chroma_client.get_collection(name="novadrive_docs")

    # Query top-k
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k
    )

    return results.get("documents", [[]])[0]  # Returns a list of top-k document texts

# Chatbot node
def chatbot_node(state: MessagesState):
    last_message = state["messages"][-1]
    query = last_message.content

    chunks = get_relevant_chunks(query)
    context = "\n".join(chunks)

    system_prompt = """
You are a helpful assistant for our company, Novadrive Automotive.
1. Only provide information related to the company from the context provided.
2. If the user greets you, respond politely but guide them to company info.
3. If asked about unrelated topics, say you can only provide company-related info.
4. Keep answers short, friendly, and professional.
"""

    history_text = "\n".join([f"{m.type}: {m.content}" for m in state["messages"]])
    prompt = f"{system_prompt}\n\nConversation so far:\n{history_text}\n\nContext:\n{context}\n\nUser: {query}\nAssistant:"

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    answer = response.text.strip()
    return {"messages": [{"role": "assistant", "content": answer}]}


builder = StateGraph(MessagesState)
builder.add_node("chatbot", chatbot_node)
builder.add_edge(START, "chatbot")
graph = builder.compile(checkpointer=checkpointer)

# Chat interface with session memory
def answer_question(query, user_id="u1"):
    result = graph.invoke(
        {"messages": [{"role": "user", "content": query}]},
        {"configurable": {"thread_id": user_id}}
    )
    return result["messages"][-1].content
