"""
URL configuration for MediMapAi project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/pharmacy/', include('pharmacy.urls')),
    path('api/search/', include('search.urls')),
    path('api/ai/', include('ai_module.urls')),
]
