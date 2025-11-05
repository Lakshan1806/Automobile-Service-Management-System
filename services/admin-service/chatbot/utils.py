import os
from dotenv import load_dotenv
from google import genai
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.vectorstores import Chroma

load_dotenv()
GEMINI_API_KEY = os.getenv("API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

CHROMA_DIR = os.path.join(os.getcwd(), "chroma_store")


# Extract text from PDF
def extract_text_from_pdf(file_path):
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    return documents


#Store PDF chunks & embeddings in ChromaDB
def store_pdf_data(file_path):
    print("📄 Extracting and embedding PDF content...")
    documents = extract_text_from_pdf(file_path)

    # Split text into overlapping chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)

    # Create embeddings (using HuggingFace for local embedding)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Store in local ChromaDB
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR
    )

    vectorstore.persist()
    print(f"✅ Stored {len(chunks)} chunks in ChromaDB at {CHROMA_DIR}")


#Get relevant chunks from ChromaDB
def get_relevant_chunks(query):
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    docs = retriever.invoke(query)
    return [doc.page_content for doc in docs]


# Answer user question using retrieved context + Gemini LLM
def answer_question(query):
    chunks = get_relevant_chunks(query)
    context = "\n".join(chunks)
    
    system_prompt = """
You are a helpful assistant for our company.
1. Only provide information related to the company from the context provided.
2. If the user asks greetings (hi, hello, good morning, etc.), respond politely but guide them to company info.
3. If the user asks questions outside the company context, respond politely that you can only provide company-related info.
4. Try to answer naturally and concisely.
"""

    # Combine prompt and user query
    user_prompt = f"Context:\n{context}\n\nQuestion: {query}"

    # Call Gemini API directly
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"{system_prompt}\n{user_prompt}"
    )

    return response.text
