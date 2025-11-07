from django.test import TestCase, Client
from unittest.mock import patch, MagicMock

class AskQuestionViewTest(TestCase):
    def setUp(self):
        self.client = Client()

    def _mock_auth(self, mock_auth):
        principal = MagicMock()
        principal.is_authenticated = True
        principal.subject = "1"
        principal.email = "test@example.com"
        principal.realm = "customers"
        principal.roles = ["CUSTOMER"]
        mock_auth.return_value = (principal, "mock_token")

    @patch("chatbot.views.answer_question")
    @patch("core_auth.authentication.JwtAuthentication.authenticate")
    def test_no_question_provided(self, mock_auth, mock_answer):
        self._mock_auth(mock_auth)
        response = self.client.get("/chat/ask/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    @patch("chatbot.views.answer_question")
    @patch("core_auth.authentication.JwtAuthentication.authenticate")
    def test_question_returns_answer(self, mock_auth, mock_answer):
        self._mock_auth(mock_auth)
        mock_answer.return_value = "Mock answer"
        response = self.client.get("/chat/ask/", {"q": "Hello"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["answer"], "Mock answer")
        mock_answer.assert_called_once_with("Hello", user_id="1")
