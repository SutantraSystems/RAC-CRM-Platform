from datetime import datetime
import pandas as pd

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .deduplication import ContactIndex, build_dedup_hash
from .models import RACStudent,StudentReminder
from .pagination import StandardPagination
from .serializers import ( RACStudentListSerializer, RACStudentSerializer,RescheduleSerializer,StudentReminderSerializer,
 RACStudentListSerializer, RACStudentSerializer, StudentDocumentSerializer, StudentCommentSerializer )

from django.db.models import Count
from rest_framework import generics,status
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import RACStudent, StudentDocument, StudentComment
import re
import os
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

# Words that are commonly added to file names but are not part of the location.
_FILENAME_NOISE_WORDS = {
    "student", "students", "data", "list", "lead", "leads",
    "sheet", "copy", "final", "new", "rac", "crm", "excel", "file",
}


def location_from_filename(filename):
   
    if not filename:
        return None

    stem = os.path.splitext(os.path.basename(filename))[0]
    stem = re.sub(r"\(\d+\)", " ", stem)         
    stem = re.sub(r"[_\-.]+", " ", stem)           
    words = [
        w for w in stem.split()
        if w.lower() not in _FILENAME_NOISE_WORDS and not w.isdigit()
    ]
    return " ".join(words).title() or None


def apply_location_source_filters(queryset, params):
    """Apply the location / source_file query params to a queryset."""
    location = params.get("location")
    source_file = params.get("source_file")
    if location:
        queryset = queryset.filter(location__iexact=location.strip())
    if source_file:
        queryset = queryset.filter(source_file=source_file)
    return queryset


def normalize_mobile_number(value):
    value = clean_value(value)

    if not value:
        return None

    value = re.sub(r"[^\d+]", "", value)

    return value

def filter_by_status(queryset, status_param):
    """Filter by status. Not Sure is the catch-all: any student whose status is not one of the other seven (blank, missing, unknown) counts as Not Sure."""
    if status_param == RACStudent.STATUS_NOT_SURE:
        others = [
            value for value, _ in RACStudent.STATUS_CHOICES
            if value != RACStudent.STATUS_NOT_SURE
        ]
        return queryset.exclude(status__in=others)
    return queryset.filter(status=status_param)

# CRUD + search/filter endpoints for RACStudent records.
class RACStudentViewSet(viewsets.ModelViewSet):
    queryset = RACStudent.objects.all().order_by("-created_at","-id")
    serializer_class = RACStudentSerializer
    pagination_class = StandardPagination

    # Use the lighter list serializer only for the list action.
    def get_serializer_class(self):
        if self.action == "list":
            return RACStudentListSerializer
        return RACStudentSerializer

    # Apply search/country/intake/year/status filters on top of the base queryset.
    def get_queryset(self):
        queryset = RACStudent.objects.all().order_by("-created_at","-id")

        search = self.request.query_params.get("search")
        country = self.request.query_params.get("country")
        intake = self.request.query_params.get("intake")
        year = self.request.query_params.get("year")
        status_param = self.request.query_params.get("status")
        location = self.request.query_params.get("location")
        source_file = self.request.query_params.get("source_file")


        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search)
                | Q(email__icontains=search)
                | Q(mobile_number__icontains=search)
                | Q(passport_number__icontains=search)
                | Q(preferred_country__icontains=search)
                | Q(academic_details__icontains=search)
                | Q(work_experience__icontains=search)
                | Q(address__icontains=search)
                | Q(parent_name__icontains=search)
            )

        if country:
            queryset = queryset.filter(
                preferred_country=country
            )

        if intake:
            queryset = queryset.filter(
                intake=intake
            )

        if status_param:
            queryset = filter_by_status(queryset, status_param)

        if year:
            queryset = queryset.filter(
                year=year
            )

        if location:
                    queryset = queryset.filter(location__iexact=location)

        if source_file:
                    queryset = queryset.filter(source_file=source_file)

        return queryset
    
        
    # Stamp created_by with the logged-in user's email on manual "Add Student".
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.email)

    def perform_update(self, serializer):
        serializer.save()
        

# Turn an Excel cell into a clean string, or None if it's blank/NaN.
def clean_value(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    if value.lower() in ["nan", "none", "null", ""]:
        return None
    return value

# Parse an Excel cell into a date, or None if it can't be parsed.
def parse_date(value):
    if pd.isna(value):
        return None

    try:
        date_value = pd.to_datetime(
            value,
            errors="coerce"
        )
        if pd.isna(date_value):
            return None
        return date_value.date()
    except Exception:
        return None

# Parse an Excel cell into a float test score, or None if invalid.
def parse_test_score(value):
    if pd.isna(value):
        return None

    try:
        return float(value)
    except Exception:
        return None

# Parse an Excel cell (with optional commas) into a float budget.
def parse_budget(value):
    if pd.isna(value):
        return None

    try:
        value = str(value).replace(",", "").strip()
        return float(value)
    except Exception:
        return None

# Parse an Excel cell into one of the valid Intake choices.A blank or unrecognised value becomes "not_sure".

def parse_intake(value):
    if pd.isna(value):
        return "not_sure"

    value = str(value).strip().lower().replace(" ", "_")
    valid = {"fall", "winter", "spring", "not_sure"}
    return value if value in valid else "not_sure"


# Parse an Excel cell into a 4-digit year, defaulting to 2026.
def parse_year(value):
    if pd.isna(value):
        return 2026
    try:
        return int(float(value))
    except Exception:
        return 2026

# Return the first non-empty value found under any of the given column names.
def get_column_value(row, possible_names):
    for column in possible_names:
        value = row.get(column)

        if pd.notna(value) and str(value).strip():
            return value
    return None

# Validate Excel data against the actual max_lengthdefined in the RACStudent model.
def validate_student_field_lengths(data):
    errors = []

    fields_to_validate = [
        "full_name",
        "mobile_number",
        "email",
        "passport_number",
        "preferred_country",
        "intake",
        "location",
        "source_file",
    ]

    for field_name in fields_to_validate:

        value = data.get(field_name)

        if value is None:
            continue

        field = RACStudent._meta.get_field(field_name)

        max_length = field.max_length

        if max_length is None:
            continue

        value = str(value)

        if len(value) > max_length:

            errors.append(
                f"{field_name}: value is {len(value)} characters "
                f"but maximum allowed is {max_length}. "
                f"Value: '{value}'"
            )

    return errors

# Bulk-imports students from one or more uploaded Excel/CSV files.
class UploadStudentsAPIView(APIView):

    def post(self, request):

        files = request.FILES.getlist("files")

        if not files:
            return Response(
                {"error": "No files uploaded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            total_inserted = 0
            total_skipped = 0
            total_rows = 0
            total_errors = []
            duplicate_rows = []

            # Existing database contacts
            contact_index = ContactIndex.from_queryset(
                RACStudent.objects.all()
            )

            for file in files:

                try:
                    df = pd.read_excel(file)
                except Exception as e:
                    total_errors.append(
                        f"{file.name}: Unable to read Excel file - {str(e)}"
                    )
                    continue

                df.columns = (
                    df.columns
                    .astype(str)
                    .str.strip()
                    .str.lower()
                    .str.replace(r"\s+", "_", regex=True)
                )

                total_rows += len(df)

                errors = []
                parsed_rows = []

                for index, row in df.iterrows():

                    try:

                        if row.isna().all():
                            continue

                        has_data = False

                        for value in row:
                            if clean_value(value) is not None:
                                has_data = True
                                break

                        if not has_data:
                            continue

                        full_name = get_column_value(
                            row,
                            [
                                "full_name",
                                "fullname",
                                "name",
                                "student_name",
                                "student_full_name",
                            ]
                        )

                        if not full_name:
                            errors.append(
                                f"{file.name} - Row {index + 2}: "
                                "Full name is required."
                            )
                            continue

                        email = get_column_value(
                            row,
                            [
                                "email",
                                "email_id",
                                "email_address",
                                "mail",
                            ]
                        )

                        if email:
                            email = email.lower()

                        mobile = get_column_value(
                            row,
                            [
                                "mobile_number",
                                "mobile",
                                "mobile_no",
                                "mobile_no.",
                                "phone",
                                "phone_number",
                                "contact_number",
                                "contact",
                            ]
                        )
                        mobile = normalize_mobile_number(mobile)
                        location = get_column_value(
                            row,
                            [
                                "location",
                                "city",
                                "student_location",
                                "based_in",
                            ]
                        )

                        if not location:
                            location = location_from_filename(file.name)

                        data = {
                            "full_name": full_name,

                            "email": email,

                            "mobile_number": mobile,

                            "dob": parse_date(
                                row.get("dob")
                            ),

                            "passport_number": clean_value(
                                row.get("passport_number")
                            ),

                            "academic_details": clean_value(
                                row.get("academic_details")
                            ),

                            "test_score": parse_test_score(
                                row.get("test_score")
                            ),

                            "preferred_country": clean_value(
                                row.get("preferred_country")
                            ),

                            "intake": parse_intake(
                                row.get("intake")
                            ),

                            "year": parse_year(
                                row.get("year")
                            ),

                            "budget": parse_budget(
                                row.get("budget")
                            ),

                            "work_experience": clean_value(
                                row.get("work_experience")
                            ),

                            "address": clean_value(
                                row.get("address")
                            ),

                            "parent_name": clean_value(
                                row.get("parent_name")
                            ),

                            "created_by": request.user.email,

                            # Store original Excel file name
                            "source_file": file.name,

                            # Store location from Excel
                            "location": location,

                            # Default imported student status
                            "status": RACStudent.STATUS_NOT_SURE,
                        }

                        field_errors = validate_student_field_lengths(data)

                        if field_errors:
                            for field_error in field_errors:
                                 errors.append(
                                    f"{file.name} - Row {index + 2}: "
                                    f"{field_error}"
                                )
                            continue
                        parsed_rows.append(
                            (index, data)
                        )

                    except Exception as e:

                        errors.append(
                            f"{file.name} - Row {index + 2}: {str(e)}"
                        )

                rows_seen = set()
                to_insert = []
                for index, data in parsed_rows:

                    dedup_hash = build_dedup_hash(data)

                    if dedup_hash in rows_seen:
                        total_skipped += 1
                        duplicate_rows.append(
                            f"{file.name} - Row {index + 2}: "
                            "duplicate of another row in this same file."
                        )
                        continue

                    rows_seen.add(dedup_hash)

                    if RACStudent.objects.filter(
                        dedup_hash=dedup_hash
                    ).exists():
                        total_skipped += 1
                        duplicate_rows.append(
                            f"{file.name} - Row {index + 2}: "
                            "a student with identical details already exists."
                        )
                        continue

                    # Email and mobile must be unique (DB + earlier rows).
                    reasons = []
                    if contact_index.email_exists(data["email"]):
                        reasons.append("email")
                    if contact_index.mobile_exists(data["mobile_number"]):
                        reasons.append("mobile number")
                    if reasons:
                        total_skipped += 1
                        duplicate_rows.append(
                            f"{file.name} - Row {index + 2}: "
                            f"{' and '.join(reasons)} already exists."
                        )
                        continue

                    contact_index.add(data["email"], data["mobile_number"])

                    to_insert.append(
                        RACStudent(
                            **data,
                            dedup_hash=dedup_hash
                        )
                    )               


                if to_insert:

                    RACStudent.objects.bulk_create(
                        to_insert
                    )

                    total_inserted += len(
                        to_insert
                    )

                # Add validation errors
                total_errors.extend(
                    errors
                )

            return Response(
                {
                    "success": True,
                    "files_uploaded": len(files),
                    "total_rows": total_rows,
                    "inserted": total_inserted,
                    "skipped_duplicates": total_skipped,
                    "duplicate_rows": duplicate_rows,
                    "updated": 0,
                    "failed": len(total_errors),
                    "errors": total_errors,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "success": False,
                    "error": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

# Returns a count of students matching optional country/intake/status/year filters.
@api_view(["GET"])
def student_count(request):
    queryset = RACStudent.objects.all()

    country = request.GET.get("country")
    intake = request.GET.get("intake")
    year = request.GET.get("year")
    status_param = request.GET.get("status")

    if country:
        queryset = queryset.filter(preferred_country=country)

    if intake:
        queryset = queryset.filter(intake=intake)

    if status_param:
        queryset = filter_by_status(queryset, status_param)

    if year:
        queryset = queryset.filter(year=year)

    queryset = apply_location_source_filters(queryset, request.GET)

    return Response(
        {
            "total_students": queryset.count()
        }
    )

# Student list / filter related views
@api_view(["GET"])
def student_locations(request):
    locations = (
        RACStudent.objects
        .exclude(location__isnull=True)
        .exclude(location="")
        .values_list("location", flat=True)
        .distinct()
        .order_by("location")
    )
    return Response({"locations": list(locations)})

@api_view(["GET"])
def student_source_files(request):
    files = (
        RACStudent.objects
        .exclude(source_file__isnull=True)
        .exclude(source_file="")
        .values_list("source_file", flat=True)
        .distinct()
        .order_by("source_file")
    )

    return Response({
        "source_files": list(files)
    })

# Returns counts for the Dashboard KPI cards
@api_view(["GET"])
def student_status_summary(request):
    queryset = RACStudent.objects.all()

    country = request.GET.get("country")
    year = request.GET.get("year")

    if country:
        queryset = queryset.filter(preferred_country=country)

    if year:
        queryset = queryset.filter(year=year)

    counts = queryset.values("status").annotate(count=Count("id"))

    # One key per status, all defaulting to 0.
    summary = {value: 0 for value, _ in RACStudent.STATUS_CHOICES}
    for row in counts:
        key = row["status"]
        if key not in summary:
            key = RACStudent.STATUS_NOT_SURE  
        summary[key] += row["count"] 

    return Response(summary)

# Documents — list/upload for a specific student.
class StudentDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentDocumentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return StudentDocument.objects.filter(
            student_id=self.kwargs["student_id"]
        )

    def perform_create(self, serializer):
        student = get_object_or_404(RACStudent, pk=self.kwargs["student_id"])
        serializer.save(
                student=student,
                uploaded_by=self.request.user,
            )
        
# Documents — delete. Restricted to whoever uploaded it, since there are no user roles/permissions in this app yet to base broader access on.
class StudentDocumentDeleteView(generics.DestroyAPIView):
    serializer_class = StudentDocumentSerializer

    def get_queryset(self):
        return StudentDocument.objects.filter(uploaded_by=self.request.user)

# Comments — list/add for a specific student.
class StudentCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentCommentSerializer

    def get_queryset(self):
        return StudentComment.objects.filter(
            student_id=self.kwargs["student_id"]
        )

    def perform_create(self, serializer):
        student = get_object_or_404(RACStudent, pk=self.kwargs["student_id"])
        serializer.save(
            student=student,
            user=self.request.user,
        )

# Comments — edit/delete. 
class StudentCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentCommentSerializer

    def get_queryset(self):
        return StudentComment.objects.filter(user=self.request.user)

class BulkDeleteStudentsAPIView(APIView):

    def delete(self, request):
        ids = request.data.get("ids", [])

        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "Provide a non-empty list of student ids to delete."},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_count, _ = RACStudent.objects.filter(id__in=ids).delete()

        return Response(
            {
                "success": True,
                "deleted_count": deleted_count,
            },
            status=status.HTTP_200_OK
        )

@api_view(["GET"])
def student_ids(request):
    queryset = RACStudent.objects.all()

    search = request.GET.get("search")
    country = request.GET.get("country")
    intake = request.GET.get("intake")
    year = request.GET.get("year")
    status_param = request.GET.get("status")

    if search:
        queryset = queryset.filter(
            Q(full_name__icontains=search)
            | Q(email__icontains=search)
            | Q(mobile_number__icontains=search)
            | Q(passport_number__icontains=search)
            | Q(preferred_country__icontains=search)
            | Q(academic_details__icontains=search)
            | Q(work_experience__icontains=search)
            | Q(address__icontains=search)
            | Q(parent_name__icontains=search)
        )

    if country:
        queryset = queryset.filter(preferred_country=country)

    if intake:
        queryset = queryset.filter(intake=intake)

    if status_param:
        queryset = filter_by_status(queryset, status_param)

    if year:
        queryset = queryset.filter(year=year)

    queryset = apply_location_source_filters(queryset, request.GET)

    ids = list(queryset.values_list("id", flat=True))

    return Response({"ids": ids})

def _reminders():
    return StudentReminder.objects.select_related(
        "student", "created_by", "completed_by"
    )

# List all reminders of one student / add a new one.
class StudentReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentReminderSerializer

    def get_queryset(self):
        return _reminders().filter(student_id=self.kwargs["student_id"])

    def perform_create(self, serializer):
        student = get_object_or_404(RACStudent, pk=self.kwargs["student_id"])
        serializer.save(student=student, created_by=self.request.user)


# Edit (PATCH/PUT) or delete a reminder.
class StudentReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentReminderSerializer
    queryset = _reminders()

    def perform_destroy(self, instance):
        # Completed reminders are permanent history.
        if instance.is_completed:
            raise PermissionDenied(
                "Completed reminders are kept as history and can't be deleted."
            )
        instance.delete()

# Mark a reminder as done. Safe to call twice.
@api_view(["POST"])
def reminder_complete(request, pk):
    reminder = get_object_or_404(_reminders(), pk=pk)

    if reminder.completed_at is None:
        reminder.completed_at = timezone.now()
        reminder.completed_by = request.user
        reminder.save(update_fields=["completed_at", "completed_by", "updated_at"])

    return Response(StudentReminderSerializer(reminder).data)

# Move a reminder to a new (future) date/time.
@api_view(["POST"])
def reminder_reschedule(request, pk):
    reminder = get_object_or_404(_reminders(), pk=pk)

    if reminder.is_completed:
        return Response(
            {"detail": "Completed reminders can't be rescheduled."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = RescheduleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    reminder.remind_at = serializer.validated_data["remind_at"]
    reminder.save(update_fields=["remind_at", "updated_at"])

    return Response(StudentReminderSerializer(reminder).data)

# Notification bell: every Due and Overdue reminder (not completed), oldest first, across all students.
@api_view(["GET"])
def reminder_notifications(request):
    now = timezone.now()
    queryset = _reminders().filter(
        completed_at__isnull=True,
        remind_at__lte=now,
    ).order_by("remind_at", "id")

    data = StudentReminderSerializer(queryset, many=True).data
    return Response({"count": len(data), "results": data})