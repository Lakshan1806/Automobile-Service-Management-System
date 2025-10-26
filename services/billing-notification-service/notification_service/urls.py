from django.urls import path
from .views import (
    GenerateOTPView,
    VerifyOTPView,
    SendOTPEmailView,
    GenerateBillView,
    SendBillEmailView,
    GetBillView,
    GetAndSendBillView,
    SendBillNotificationView
)

urlpatterns = [
    # OTP Services
    path('api/otp/generate/', GenerateOTPView.as_view(),
         name='generate_otp'),  # Generates OTP
    path('api/otp/send-email/', SendOTPEmailView.as_view(),
         name='send_otp_email'),  # Sends previously generated OTP
    path('api/otp/verify/', VerifyOTPView.as_view(),
         name='verify_otp'),  # Verifies OTP

    # Bill Services
    path('api/bill/generate/', GenerateBillView.as_view(), name='generate_bill'),
    path('api/bill/send/', SendBillEmailView.as_view(), name='send_bill_email'),
    path('api/bill/<str:bill_id>/', GetBillView.as_view(), name='get_bill'),
    # New endpoint to get and send bill in one call
    path('api/bill/<str:bill_id>/send/',
         GetAndSendBillView.as_view(), name='get_and_send_bill'),
    path('api/bill/<str:bill_id>/notify/',
         SendBillNotificationView.as_view(), name='send_bill_notification'),
]
