import jwt
from django.conf import settings
from .models import CustomUser


def _get_jwt_secret():
    return getattr(settings, 'JWT_SECRET', settings.SECRET_KEY)


class JWTAuthMiddleware:
    """
    Middleware that reads a Bearer JWT token from the Authorization header
    and sets request.auth_user to the corresponding CustomUser instance.
    Sets request.auth_user = None if token is missing or invalid.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.auth_user = None
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            try:
                payload = jwt.decode(token, _get_jwt_secret(), algorithms=['HS256'])
                user_id = payload.get('sub')
                if user_id:
                    request.auth_user = CustomUser.objects.get(id=user_id)
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, CustomUser.DoesNotExist):
                request.auth_user = None

        return self.get_response(request)
