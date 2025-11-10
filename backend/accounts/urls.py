from django.urls import path
from . import views

urlpatterns = [
    path('signup', views.signup, name='auth-signup'),
    path('login', views.login, name='auth-login'),
    path('me', views.me, name='auth-me'),
]
