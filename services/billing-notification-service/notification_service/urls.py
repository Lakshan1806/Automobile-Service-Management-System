from django.urls import path
from .views import (
    GenerateOTPView,
    VerifyOTPView,
    SendOTPEmailView,
    GenerateBillView,
    SendBillEmailView,
    GetBillView,
    SendBillNotificationView,
    SendNotificationView  # New unified notification endpoint
)

urlpatterns = [
    # Unified Notification Service (NEW)
    path('send/', SendNotificationView.as_view(), name='send_notification'),

    # OTP Services
    path('otp/generate/', GenerateOTPView.as_view(), name='generate_otp'),
    path('otp/send-email/', SendOTPEmailView.as_view(), name='send_otp_email'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify_otp'),

    # Bill Services
    path('bill/generate/', GenerateBillView.as_view(), name='generate_bill'),
    path('bill/send/', SendBillEmailView.as_view(), name='send_bill_email'),
    path('bill/<str:bill_id>/', GetBillView.as_view(), name='get_bill'),
    path('bill/<str:bill_id>/notify/', SendBillNotificationView.as_view(),
         name='send_bill_notification'),
]
