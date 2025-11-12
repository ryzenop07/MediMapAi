from django.urls import path
from . import views

urlpatterns = [
    path('', views.pharmacy_upsert, name='pharmacy-upsert'),
    path('inventory/', views.pharmacy_inventory, name='pharmacy-inventory'),
    path('inventory', views.pharmacy_inventory, name='pharmacy-inventory-no-slash'),
    path('me/', views.pharmacy_me, name='pharmacy-me'),
    path('me', views.pharmacy_me, name='pharmacy-me-no-slash'),
]
