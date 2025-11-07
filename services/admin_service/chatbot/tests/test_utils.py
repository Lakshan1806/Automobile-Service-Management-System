# chatbot/tests/test_utils.py
from unittest.mock import patch, MagicMock
import pytest
from chatbot.utils import extract_text_from_pdf, get_relevant_chunks, answer_question

# -----------------------------
# Test PDF extraction
# -----------------------------
@patch("chatbot.utils.PyMuPDFLoader")
def test_extract_text_from_pdf(mock_loader):
    mock_loader.return_value.load.return_value = ["Dummy text"]
    docs = extract_text_from_pdf("dummy.pdf")
    assert docs == ["Dummy text"]
    mock_loader.assert_called_once_with("dummy.pdf")

# -----------------------------
# Test chunk retrieval
# -----------------------------
@patch("chatbot.utils.st_model.encode")  # Patch SentenceTransformer encode
@patch("chatbot.utils.chroma_client.get_collection")  # Patch Chroma Cloud collection
def test_get_relevant_chunks(mock_get_collection, mock_encode):
    # Mock query embedding
    mock_encode.return_value = [[0.1, 0.2, 0.3]]

    # Mock collection query result
    mock_collection = MagicMock()
    mock_collection.query.return_value = {"documents": [["chunk1", "chunk2"]]}
    mock_get_collection.return_value = mock_collection

    chunks = get_relevant_chunks("test query")
    assert chunks == ["chunk1", "chunk2"]

    mock_encode.assert_called_once_with(["test query"])
    mock_collection.query.assert_called_once()

# -----------------------------
# Test chatbot answer generation
# -----------------------------
@patch("chatbot.utils.get_relevant_chunks")
@patch("chatbot.utils.client")
def test_answer_question(mock_client, mock_get_chunks):
    mock_get_chunks.return_value = ["Some context"]

    mock_response = MagicMock()
    mock_response.text = "This is a mock answer."
    mock_client.models.generate_content.return_value = mock_response

    answer = answer_question("Hello","u1")
    assert answer == "This is a mock answer."

    mock_get_chunks.assert_called_once()
    mock_client.models.generate_content.assert_called_once()
