from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer,ResetPasswordSerializer,UpdateProfileSerializer
from .utils import get_short_name,get_display_name
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import SAFE_METHODS


def user_payload(user):
    """Safe, frontend-facing description of a user (never contains secrets)."""
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.first_name,
        "short_name": get_display_name(user),
    }


def resolve_login_username(identifier):
 
    identifier = identifier.strip()
    UserModel = get_user_model()
    match = (
        UserModel.objects.filter(email__iexact=identifier).order_by("id").first()
        or UserModel.objects.filter(username__iexact=identifier).order_by("id").first()
    )
    return match.get_username() if match else identifier

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful.",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.first_name,
                        "short_name": get_display_name(user),
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

@method_decorator(never_cache, name="dispatch")
class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        identifier = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")

        if (
            not identifier or not password
            or not isinstance(identifier, str)
            or not isinstance(password, str)
        ):
            return Response(
                {
                    "detail":
                    "Email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        user = authenticate(
            request,
            username=resolve_login_username(identifier),
            password=password
        )
        if user is None:
            return Response(
                {
                    "detail":
                    "Invalid email or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        login(request, user)
        return Response({
            "message": "Login successful.",
            "user": user_payload(user),
        })

@method_decorator(never_cache, name="dispatch")
class LogoutView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)  # flushes the server-side session row + cookie
        return Response({
            "message": "Logout successful."
        })

@method_decorator(never_cache, name="dispatch")
class MeView(APIView):

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAuthenticated()]

    def _user_payload(self, user):
        return user_payload(user)

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"authenticated": False})

        return Response({
            "authenticated": True,
            **self._user_payload(request.user),
        })

    def patch(self, request):
        serializer = UpdateProfileSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user
            user.first_name = serializer.validated_data["full_name"]
            user.save(update_fields=["first_name"])

            return Response(self._user_payload(user))

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_view(request):
    get_token(request)
    return Response({"detail": "CSRF cookie set"})

User = get_user_model()
class CheckEmailView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        exists = User.objects.filter(email__iexact=email).exists()
        return Response({"exists": exists})

class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password updated successfully."},
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )