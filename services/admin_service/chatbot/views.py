from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import answer_question
from admin_services.authentication import JwtCustomerAuthentication
from admin_services.permissions import HasCustomerRole

class AskQuestionView(APIView):
    authentication_classes = [JwtCustomerAuthentication]
    permission_classes = [HasCustomerRole]

    required_realm = "customers"
    required_roles = ("CUSTOMER",)

    def get(self, request):
        question = request.GET.get("q", "")
        if not question:
            return Response({"error": "No question provided"}, status=400)

        try:
            user_id = request.user.subject or request.user.email or "anonymous"
            answer = answer_question(question, user_id=user_id)
            return Response({"answer": answer})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
