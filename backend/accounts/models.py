from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Extended user model with role-based access (user/pharmacist)."""

    ROLES = [
        ('user', 'User'),
        ('pharmacist', 'Pharmacist'),
    ]

    role = models.CharField(max_length=20, choices=ROLES, default='user')
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    class Meta:
        db_table = 'accounts_customuser'

    def __str__(self):
        return f"{self.email} ({self.role})"
