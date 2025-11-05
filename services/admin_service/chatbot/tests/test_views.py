# chatbot/tests/test_views.py
from django.test import TestCase, Client
from unittest.mock import patch

class AskQuestionViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_no_question_provided(self):
        response = self.client.get("/chat/ask/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("error", response.json())

    @patch("chatbot.views.answer_question")
    def test_question_returns_answer(self, mock_answer):
        mock_answer.return_value = "Mock answer"
        response = self.client.get("/chat/ask/", {"q": "Hello"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["answer"], "Mock answer")
        mock_answer.assert_called_once_with("Hello")
