# chatbot/tests/test_utils.py
from unittest.mock import patch, MagicMock
import pytest
from chatbot.utils import extract_text_from_pdf, get_relevant_chunks, answer_question

# Test PDF extraction
@patch("chatbot.utils.PyMuPDFLoader")
def test_extract_text_from_pdf(mock_loader):
    mock_loader.return_value.load.return_value = ["Dummy text"]
    docs = extract_text_from_pdf("dummy.pdf")
    assert docs == ["Dummy text"]
    mock_loader.assert_called_once_with("dummy.pdf")

# Test chunk retrieval
@patch("chatbot.utils.Chroma")
@patch("chatbot.utils.HuggingFaceEmbeddings")
def test_get_relevant_chunks(mock_embeddings, mock_chroma):
    mock_vectorstore = MagicMock()
    mock_vectorstore.as_retriever.return_value.invoke.return_value = [
        MagicMock(page_content="chunk1"),
        MagicMock(page_content="chunk2")
    ]
    mock_chroma.return_value = mock_vectorstore
    chunks = get_relevant_chunks("test query")
    assert chunks == ["chunk1", "chunk2"]

# Test chatbot answer generation
@patch("chatbot.utils.client")
@patch("chatbot.utils.get_relevant_chunks")
def test_answer_question(mock_get_chunks, mock_client):
    mock_get_chunks.return_value = ["Some context"]
    mock_response = MagicMock()
    mock_response.text = "This is a mock answer."
    mock_client.models.generate_content.return_value = mock_response

    answer = answer_question("Hello")
    assert answer == "This is a mock answer."
    mock_get_chunks.assert_called_once()
    mock_client.models.generate_content.assert_called_once()
