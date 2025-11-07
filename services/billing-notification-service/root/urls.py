"""
URL configuration for root project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an impor t:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection


def health_check(request):
    """Health check endpoint to verify service is running"""
    try:
        # Check database connection
        connection.ensure_connection()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return JsonResponse({
        'status': 'running',
        'service': 'Automobile Service Management - Billing & Notification',
        'database': db_status,
        'endpoints': {
            'admin': '/admin/',
            'notification_api': '/api/notification/',
            'admin_api': '/api/admin/',
            'health': '/health/'
        }
    })


urlpatterns = [
    path('', health_check, name='home'),  # Root URL shows health status
    path('health/', health_check, name='health_check'),  # Health check endpoint
    path('admin/', admin.site.urls),
    # Notification Service APIs (OTP & Billing)
    path('api/notification/', include('notification_service.urls')),
    # Admin Service APIs (Dashboard)
    path('api/admin/', include('admin_service.urls')),
]
