from django.db import models

from CRM.deduplication import DUPLICATE_CHECK_FIELDS, build_dedup_hash


class RACStudent(models.Model):

    full_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    dob = models.DateField(
        null=True,
        blank=True,
    )

    mobile_number = models.CharField(
        max_length=15,
        db_index=True,
        null=True,
        blank=True,
    )

    email = models.EmailField(
        db_index=True,
        null=True,
        blank=True,
    )

    passport_number = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        db_index=True,
    )

    academic_details = models.TextField(
        null=True,
        blank=True,
        db_index=True,
    )

    test_score = models.FloatField(
        null=True,
        blank=True,
    )

    preferred_country = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
    )

    intake_date = models.DateField(
        null=True,
        blank=True,
    )

    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    work_experience = models.TextField(
        null=True,
        blank=True,
    )

    address = models.TextField(
        null=True,
        blank=True,
    )

    parent_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )
    created_by = models.EmailField(
        null=True,
        blank=True,
        help_text="Email of the logged-in user who created/uploaded this record.",
    )

    dedup_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        editable=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "rac_students"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        data = {
            field: getattr(self, field)
            for field in DUPLICATE_CHECK_FIELDS
        }

        self.dedup_hash = build_dedup_hash(data)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name or f"Student {self.pk}"