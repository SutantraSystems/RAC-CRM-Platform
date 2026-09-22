from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(
        max_length=150,
        allow_blank=False,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    password_confirm = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "password",
            "password_confirm",
        ]

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Full name is required."
            )
        return value

    def validate_email(self, value):

        value = value.lower().strip()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def validate(self, data):

        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm":
                "Passwords do not match."
            })
        return data

    def create(self, validated_data):

        validated_data.pop("password_confirm")
        email = validated_data["email"]
        full_name = validated_data["full_name"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
            first_name=full_name,
        )
        return user

class ResetPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()
    new_password = serializers.CharField(
        write_only=True,
        min_length=8
    )
    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate_email(self, value):
        value = value.lower().strip()
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "No account found with this email."
            )
        return value

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })
        return data

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email__iexact=email)
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user