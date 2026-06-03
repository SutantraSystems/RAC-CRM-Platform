from rest_framework import serializers
from .models import RACStudent

# validates the field to be optional and allow null
class RACStudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = RACStudent
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    extra_kwargs = {
        "full_name": {"required": False, "allow_null": True},
        "dob": {"required": False, "allow_null": True},
        "mobile_number": {"required": False, "allow_null": True},
        "email": {"required": False, "allow_null": True},
        "passport_number": {"required": False, "allow_null": True},
        "academic_details": {"required": False, "allow_null": True},
        "test_score": {"required": False, "allow_null": True},
        "preferred_country": {"required": False, "allow_null": True},
        "intake_date": {"required": False, "allow_null": True},
        "budget": {"required": False, "allow_null": True},
        "work_experience": {"required": False, "allow_null": True},     
        "address": {"required": False, "allow_null": True},
        "parent_name": {"required": False, "allow_null": True},
    }


# Views the student data in list
class RACStudentListSerializer(serializers.ModelSerializer):

    class Meta:
        model = RACStudent
        fields = "__all__"