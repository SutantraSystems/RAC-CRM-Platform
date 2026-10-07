from django.db import models
from django.conf import settings
from CRM.deduplication import DUPLICATE_CHECK_FIELDS, build_dedup_hash
from datetime import timedelta
from django.utils import timezone

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
    INTAKE_FALL = "fall"
    INTAKE_WINTER = "winter"
    INTAKE_SPRING = "spring"
    INTAKE_NOT_SURE = "not_sure"

    INTAKE_CHOICES = [
        (INTAKE_FALL, "Fall"),
        (INTAKE_WINTER, "Winter"),
        (INTAKE_SPRING, "Spring"),
        (INTAKE_NOT_SURE, "Not Sure"),
    ]

    intake = models.CharField(
        max_length=20,
        choices=INTAKE_CHOICES,
        default=INTAKE_NOT_SURE,
        null=True,
        blank=True,
    )

    year = models.PositiveIntegerField(
        null=True,
        blank=True,
        default=2026,
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

    STATUS_NOT_INTERESTED = "not_interested"
    STATUS_INTERESTED = "interested"
    STATUS_NOT_SURE = "not_sure"
    STATUS_SHORTLISTING_DONE = "shortlisting_done"
    STATUS_DOCS_SHARED = "docs_shared"
    STATUS_APPLIED = "applied"
    STATUS_DEPOSIT_PAID = "deposit_paid"
    STATUS_VISA_GRANTED = "visa_granted"

    STATUS_CHOICES = [
        (STATUS_NOT_INTERESTED, "Not Interested"),
        (STATUS_INTERESTED, "Interested"),
        (STATUS_NOT_SURE, "Not Sure"),
        (STATUS_SHORTLISTING_DONE, "Shortlisting Done"),
        (STATUS_DOCS_SHARED, "Docs Shared"),
        (STATUS_APPLIED, "Applied"),
        (STATUS_DEPOSIT_PAID, "Deposit Paid"),
        (STATUS_VISA_GRANTED, "Visa Granted"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NOT_SURE,
        db_index=True,
    )

    location = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
    )

    source_file = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        db_index=True,
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
        # A blank intake is stored as "Not Sure" (never NULL / empty).
        if not self.intake:
            self.intake = self.INTAKE_NOT_SURE

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

class StudentReminder(models.Model):

    STATUS_UPCOMING = "upcoming"
    STATUS_DUE = "due"
    STATUS_OVERDUE = "overdue"
    STATUS_COMPLETED = "completed"

    student = models.ForeignKey(
        RACStudent,
        on_delete=models.CASCADE,
        related_name="reminders",
    )

    title = models.CharField(max_length=255)

    # One timezone-aware moment (stored in UTC). The browser sends the date and time the user picked (in IST), converted to this moment.
    remind_at = models.DateTimeField()

    notes = models.TextField(blank=True, default="")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    # Completed reminders stay as history; completed_at marks them as done.
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "rac_student_reminders"
        ordering = ["remind_at", "id"]
        indexes = [
            models.Index(fields=["completed_at", "remind_at"]),
        ]

    def __str__(self):
        return f"Reminder '{self.title}' for {self.student}"

    @staticmethod
    def due_window():
        """How long a reminder stays "Due" before it becomes "Overdue"."""
        return timedelta(
            minutes=getattr(settings, "REMINDER_DUE_WINDOW_MINUTES", 1440)
        )

    @property
    def is_completed(self):
        return self.completed_at is not None

    def get_status(self, now=None):
        """Status is worked out from the clock, never stored."""
        if self.completed_at is not None:
            return self.STATUS_COMPLETED

        now = now or timezone.now()
        if self.remind_at > now:
            return self.STATUS_UPCOMING
        if now - self.remind_at <= self.due_window():
            return self.STATUS_DUE
        return self.STATUS_OVERDUE