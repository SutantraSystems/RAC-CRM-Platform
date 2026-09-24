from rest_framework import serializers
from accounts.utils import get_short_name
from .deduplication import DUPLICATE_CHECK_FIELDS, ContactIndex, build_dedup_hash
from .models import RACStudent,StudentComment,StudentDocument

class RACStudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = RACStudent
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "dedup_hash","created_by"]
        extra_kwargs = {
            field: {"required": False, "allow_null": True}
            for field in DUPLICATE_CHECK_FIELDS
        }

    def validate(self, attrs):
        
        data = {}
        for field in DUPLICATE_CHECK_FIELDS:
            if field in attrs:
                data[field] = attrs[field]
            elif self.instance is not None:
                data[field] = getattr(self.instance, field)
            else:
                data[field] = None

        dedup_hash = build_dedup_hash(data)

        duplicate_query = RACStudent.objects.filter(dedup_hash=dedup_hash)
        if self.instance is not None:
            duplicate_query = duplicate_query.exclude(pk=self.instance.pk)

        if duplicate_query.exists():
            raise serializers.ValidationError({
                "duplicate": "A student with the same details already exists."
            })

        # Email and mobile number must each be unique across students.
        others = RACStudent.objects.all()
        if self.instance is not None:
            others = others.exclude(pk=self.instance.pk)
        index = ContactIndex.from_queryset(others)

        errors = {}
        if index.email_exists(data.get("email")):
            errors["email"] = "A student with this email already exists."
        if index.mobile_exists(data.get("mobile_number")):
            errors["mobile_number"] = "A student with this mobile number already exists."
        if errors:
            raise serializers.ValidationError(errors)

        return attrs

class RACStudentListSerializer(serializers.ModelSerializer):

    class Meta:
        model = RACStudent
        fields = "__all__"

class StudentDocumentSerializer(serializers.ModelSerializer):

    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentDocument
        fields = [
            "id", "student", "file", "document_type",
            "uploaded_by", "uploaded_by_name", "uploaded_at",
        ]
        read_only_fields = ["id", "student", "uploaded_by", "uploaded_at"]

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return get_short_name(obj.uploaded_by.first_name) or obj.uploaded_by.email
        return None

class StudentCommentSerializer(serializers.ModelSerializer):

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentComment
        fields = [
            "id", "student", "user", "user_name",
            "comment", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "student", "user", "created_at", "updated_at"]

    def get_user_name(self, obj):
        if obj.user:
            return get_short_name(obj.user.first_name) or obj.user.email
        return None