from django.http import JsonResponse
from .utils import answer_question

def ask_question(request):
    question = request.GET.get("q", "")
    if not question:
        return JsonResponse({"error": "No question provided"})

    try:
        answer = answer_question(question)
        return JsonResponse({"answer": answer})
    except Exception as e:
        return JsonResponse({"error": str(e)})
