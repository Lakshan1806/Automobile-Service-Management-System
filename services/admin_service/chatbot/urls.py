from django.urls import path
from .views import AskQuestionView

urlpatterns = [
    path("ask/", AskQuestionView.as_view(), name="ask_question"),
]
