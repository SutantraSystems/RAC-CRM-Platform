from rest_framework import serializers
from accounts.utils import get_short_name
from .deduplication import (
    DUPLICATE_CHECK_FIELDS, ContactIndex, build_dedup_hash, parse_mobile_numbers,
    split_mobile_numbers, describe_mobile_conflict, describe_repeated_mobile,
)
from .models import RACStudent,StudentComment,StudentDocument,StudentReminder,University,Payment
from django.utils import timezone

class RACStudentSerializer(serializers.ModelSerializer):

    class Meta:
        model = RACStudent
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "dedup_hash","created_by"]
        extra_kwargs = {
            **{
                field: {"required": False, "allow_null": True}
                for field in DUPLICATE_CHECK_FIELDS
            },

            "status": {"required": False, "allow_null": True, "allow_blank": True},
          
            "mobile_number": {"required": False, "allow_null": True, "max_length": None},
        }

    def validate(self, attrs):

        if "status" in attrs and not attrs["status"]:
            attrs["status"] = RACStudent.STATUS_NOT_SURE

        if "mobile_number" in attrs or "alternate_mobile_number" in attrs:
            mobile_raw = (
                attrs["mobile_number"] if "mobile_number" in attrs
                else getattr(self.instance, "mobile_number", None)
            )
            alternate_raw = (
                attrs["alternate_mobile_number"] if "alternate_mobile_number" in attrs
                else getattr(self.instance, "alternate_mobile_number", None)
            )
            mobile, alternate, mobile_errors, repeated = parse_mobile_numbers(mobile_raw, alternate_raw)
            for field, number in repeated:
                mobile_errors[field] = (
                    mobile_errors.get(field, "") + f" {describe_repeated_mobile(number)}."
                ).strip()
            if mobile_errors:
                raise serializers.ValidationError(mobile_errors)
            attrs["mobile_number"] = mobile
            attrs["alternate_mobile_number"] = alternate

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

        # Every number (primary and alternate) must be unique across ALL students primary and alternate numbers.
        alternate_value = (
            attrs["alternate_mobile_number"] if "alternate_mobile_number" in attrs
            else getattr(self.instance, "alternate_mobile_number", None)
        )
        for field, numbers in (
            ("mobile_number", split_mobile_numbers(data.get("mobile_number"))),
            ("alternate_mobile_number", split_mobile_numbers(alternate_value)),
        ):
            conflicts = index.mobile_conflicts(numbers)
            if conflicts:
                errors[field] = " ".join(
                    f"{describe_mobile_conflict(number, owner)}." for number, owner in conflicts
                )
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

FUTURE_MESSAGE = "Please select a future date and time."

def _user_name(user):
    if not user:
        return None
    return get_short_name(user.first_name) or user.email


class StudentReminderSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    completed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentReminder
        fields = [
            "id", "student", "student_name",
            "title", "remind_at", "notes",
            "status",
            "created_by", "created_by_name",
            "completed_at", "completed_by", "completed_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "student", "created_by",
            "completed_at", "completed_by",
            "created_at", "updated_at",
        ]

    def get_status(self, obj):
        return obj.get_status()

    def get_student_name(self, obj):
        return obj.student.full_name or "Unnamed Student"

    def get_created_by_name(self, obj):
        return _user_name(obj.created_by)

    def get_completed_by_name(self, obj):
        return _user_name(obj.completed_by)

    def validate_title(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value

    def validate_remind_at(self, value):
        # New reminders, and any reminder whose time is being changed, must be in the future. 
        if self.instance is not None and value == self.instance.remind_at:
            return value
        if value <= timezone.now():
            raise serializers.ValidationError(FUTURE_MESSAGE)
        return value

    def validate_notes(self, value):
        return (value or "").strip()

    def validate(self, attrs):
        # Completed reminders are history: no editing.
        if self.instance is not None and self.instance.is_completed:
            raise serializers.ValidationError(
                "Completed reminders can't be edited."
            )
        return attrs

class RescheduleSerializer(serializers.Serializer):
    remind_at = serializers.DateTimeField()

    def validate_remind_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError(FUTURE_MESSAGE)
        return value

class UniversitySerializer(serializers.ModelSerializer):

    class Meta:
        model = University
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]
        extra_kwargs = {
            "name": {
                "error_messages": {
                    "required": "Name is required.",
                    "blank": "Name is required.",
                    "null": "Name is required.",
                }
            }
        }


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]
        extra_kwargs = {
            "student_name": {
                "error_messages": {
                    "required": "Student Name is required.",
                    "blank": "Student Name is required.",
                    "null": "Student Name is required.",
                }
            },
            # A blank status / intake is accepted and saved with its default.
            "status": {"required": False, "allow_null": True, "allow_blank": True},
            "intake": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value

    def validate(self, attrs):
        if "status" in attrs and not attrs["status"]:
            attrs["status"] = Payment.STATUS_PENDING
        if "intake" in attrs and not attrs["intake"]:
            attrs["intake"] = Payment.INTAKE_NOT_SURE
        return attrs