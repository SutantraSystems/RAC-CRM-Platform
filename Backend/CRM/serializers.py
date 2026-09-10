from rest_framework import serializers

from .deduplication import DUPLICATE_CHECK_FIELDS, build_dedup_hash
from .models import RACStudent


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

        return attrs


class RACStudentListSerializer(serializers.ModelSerializer):

    class Meta:
        model = RACStudent
        fields = "__all__"
