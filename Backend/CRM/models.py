from django.db import models
from django.conf import settings
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
        ordering = ["-created_at" ,"-id"]

    def save(self, *args, **kwargs):
        data = {
            field: getattr(self, field)
            for field in DUPLICATE_CHECK_FIELDS
        }

        self.dedup_hash = build_dedup_hash(data)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name or f"Student {self.pk}"
    

class StudentDocument(models.Model):

    student = models.ForeignKey(
        RACStudent,
        on_delete=models.CASCADE,
        related_name="documents",
    )

    file = models.FileField(
        upload_to="student_documents/%Y/%m/",
    )

    document_type = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rac_student_documents"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.document_type or 'Document'} — {self.student}"

class StudentComment(models.Model):

    student = models.ForeignKey(
        RACStudent,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    comment = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "rac_student_comments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.user} on {self.student}"

class StudentActivity(models.Model):

    ACTION_CHOICES = [
        ("created", "Student Created"),
        ("updated", "Student Updated"),
        ("comment_added", "Comment Added"),
        ("document_uploaded", "Document Uploaded"),
    ]

    student = models.ForeignKey(
        RACStudent,
        on_delete=models.CASCADE,
        related_name="activities",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rac_student_activity"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} — {self.student} ({self.created_at})"