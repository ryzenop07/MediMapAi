from django.urls import path
from . import views

urlpatterns = [
    path('suggest/', views.suggest, name='ai-suggest'),
    path('suggest', views.suggest, name='ai-suggest-no-slash'),
]
