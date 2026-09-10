from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):

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
            "email",
            "password",
            "password_confirm",
        ]

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
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
        )
        return user