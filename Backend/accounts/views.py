from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer,ResetPasswordSerializer
from .utils import get_short_name
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes

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
                        "short_name": get_short_name(user.first_name),
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {
                    "detail":
                    "Email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        email = email.lower().strip()
        user = authenticate(
            request,
            username=email,
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
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.first_name,
                "short_name": get_short_name(user.first_name),
            }
        })

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({
            "message": "Logout successful."
        })

class MeView(APIView):

    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.first_name,
            "short_name": get_short_name(user.first_name),
        })

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