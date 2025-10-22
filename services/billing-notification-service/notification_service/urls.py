from django.urls import path
from . import views

urlpatterns = [
    # OTP Services
    path('api/otp/generate/', views.generate_otp,
         name='generate_otp'),  # Generates OTP
    path('api/otp/send-email/', views.send_otp_email,
         name='send_otp_email'),  # Sends previously generated OTP
    path('api/otp/verify/', views.verify_otp,
         name='verify_otp'),  # Verifies OTP


    # Bill Services
    path('api/bill/generate/', views.generate_bill, name='generate_bill'),
    path('api/bill/send/', views.send_bill_email, name='send_bill_email'),
    path('api/bill/<str:bill_id>/', views.get_bill, name='get_bill'),
    # New endpoint to get and send bill in one call
    path('api/bill/<str:bill_id>/send/',
         views.get_and_send_bill, name='get_and_send_bill'),
    path('api/bill/<str:bill_id>/notify/',
         views.send_bill_notification, name='send_bill_notification'),
]
