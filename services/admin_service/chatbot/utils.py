import os
from dotenv import load_dotenv
from google import genai
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.vectorstores import Chroma
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, MessagesState, START

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("API_KEY")

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Define Chroma directory
CHROMA_DIR = os.path.join(os.getcwd(), "chroma_store")

# Memory handler for chat sessions
checkpointer = MemorySaver()


# Extract text from PDF
def extract_text_from_pdf(file_path):
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    return documents


# Store PDF chunks & embeddings in ChromaDB
def store_pdf_data(file_path):
    print("📄 Extracting and embedding PDF content...")
    documents = extract_text_from_pdf(file_path)

    # Split text into overlapping chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Store in local ChromaDB
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR
    )

    vectorstore.persist()
    print(f"✅ Stored {len(chunks)} chunks in ChromaDB at {CHROMA_DIR}")


# Retrieve top-matching text chunks
def get_relevant_chunks(query):
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    docs = retriever.invoke(query)
    return [doc.page_content for doc in docs]


# Chatbot node
def chatbot_node(state: MessagesState):
    # Get last user query
    last_message = state["messages"][-1]
    query = last_message.content

    # Retrieve relevant company info
    chunks = get_relevant_chunks(query)
    context = "\n".join(chunks)

    # System prompt
    system_prompt = """
You are a helpful assistant for our company, Novadrive Automotive.
1. Only provide information related to the company from the context provided.
2. If the user greets you, respond politely but guide them to company info.
3. If asked about unrelated topics, say you can only provide company-related info.
4. Keep answers short, friendly, and professional.
"""

    # Build conversation so far
    history_text = "\n".join([f"{m.type}: {m.content}" for m in state["messages"]])

    # Combine into final prompt
    prompt = f"{system_prompt}\n\nConversation so far:\n{history_text}\n\nContext:\n{context}\n\nUser: {query}\nAssistant:"

    # Generate using Gemini
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    # Extract and return
    answer = response.text.strip()
    return {"messages": [{"role": "assistant", "content": answer}]}


# Build stateful chat graph
builder = StateGraph(MessagesState)
builder.add_node("chatbot", chatbot_node)
builder.add_edge(START, "chatbot")

# Compile with memory checkpointer
graph = builder.compile(checkpointer=checkpointer)


# Chat interface with session memory
def answer_question(query, user_id="u1"):
    result = graph.invoke(
        {"messages": [{"role": "user", "content": query}]},
        {"configurable": {"thread_id": user_id}}  # session tracking
    )
    return result["messages"][-1].content
