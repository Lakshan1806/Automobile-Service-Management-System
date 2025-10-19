from django.urls import path
from . import views

urlpatterns = [
    # OTP Services
    path('api/otp/generate/', views.generate_otp, name='generate_otp'),
    path('api/otp/verify/', views.verify_otp, name='verify_otp'),
    path('api/otp/send/', views.send_otp_email, name='send_otp_email'),
    path('api/otp/send-email/', views.send_otp_email,
         name='send_otp_email_alternative'),

    # Bill Services
    path('api/bill/generate/', views.generate_bill, name='generate_bill'),
    path('api/bill/send/', views.send_bill_email, name='send_bill_email'),
    path('api/bill/<str:bill_id>/', views.get_bill, name='get_bill'),
    path('api/bill/<str:bill_id>/notify/',
         views.send_bill_notification, name='send_bill_notification'),
]
