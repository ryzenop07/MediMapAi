import json
import re
import jwt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from .models import CustomUser


def _get_jwt_secret():
    return getattr(settings, 'JWT_SECRET', settings.SECRET_KEY)


# ── Signup ────────────────────────────────────────────────────────────────────

@csrf_exempt
def signup(request):
    """POST /api/auth/signup — create a new user account."""
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'message': 'Invalid JSON'}, status=400)

    name = (body.get('name') or '').strip()
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    role = body.get('role') or 'user'

    # Map "patient" -> "user" (frontend may send either)
    if role == 'patient':
        role = 'user'

    # Validation
    if len(name) < 2:
        return JsonResponse({'message': 'Name is too short'}, status=400)
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        return JsonResponse({'message': 'Invalid email'}, status=400)
    if len(password) < 6:
        return JsonResponse({'message': 'Password should be at least 6 chars'}, status=400)
    if role not in ('user', 'pharmacist'):
        return JsonResponse({'message': 'Invalid role'}, status=400)

    if CustomUser.objects.filter(email=email).exists():
        return JsonResponse({'message': 'Email already in use'}, status=409)

    # Generate a unique username from email prefix
    base_username = email.split('@')[0]
    username = base_username
    counter = 1
    while CustomUser.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    user = CustomUser.objects.create(
        username=username,
        first_name=name,
        email=email,
        password=make_password(password),
        role=role,
    )

    return JsonResponse({'id': user.id, 'message': 'Account created'}, status=201)


# ── Login ─────────────────────────────────────────────────────────────────────

@csrf_exempt
def login(request):
    """POST /api/auth/login — authenticate and return JWT token."""
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'message': 'Invalid JSON'}, status=400)

    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    role = body.get('role') or 'user'

    if role == 'patient':
        role = 'user'

    if not email or len(password) < 6:
        return JsonResponse({'message': 'Invalid credentials'}, status=400)

    try:
        user = CustomUser.objects.get(email=email, role=role)
    except CustomUser.DoesNotExist:
        return JsonResponse({'message': 'Account not found'}, status=404)

    if not check_password(password, user.password):
        return JsonResponse({'message': 'Invalid credentials'}, status=401)

    token = jwt.encode(
        {'sub': user.id, 'role': user.role},
        _get_jwt_secret(),
        algorithm='HS256',
    )

    return JsonResponse({'token': token})


# ── Me (current user) ─────────────────────────────────────────────────────────

def me(request):
    """GET /api/auth/me — return current user info (protected)."""
    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    if not hasattr(request, 'auth_user') or request.auth_user is None:
        return JsonResponse({'message': 'Unauthorized'}, status=401)

    user = request.auth_user
    return JsonResponse({
        'id': user.id,
        'name': user.first_name or user.username,
        'email': user.email,
        'role': user.role,
    })
