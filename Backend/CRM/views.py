import pandas as pd
from datetime import datetime, time, timedelta, timezone as dt_timezone

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .deduplication import (
    ContactIndex, build_dedup_hash, parse_mobile_numbers, all_mobile_numbers,
    describe_mobile_conflict, describe_repeated_mobile,
)
from .models import RACStudent, StudentReminder, University, Payment
from .pagination import StandardPagination
from .serializers import (
    RACStudentListSerializer, RACStudentSerializer, RescheduleSerializer,
    StudentReminderSerializer, StudentDocumentSerializer, StudentCommentSerializer,
    UniversitySerializer, PaymentSerializer, _user_name,
)

from django.db.models import Count
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import StudentDocument, StudentComment
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


def filter_by_status(queryset, status_param):
    """Filter by status. Not Sure is the catch-all: any student whose status is not one of the other statuses (blank, missing, unknown) counts as Not Sure."""
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
                | Q(alternate_mobile_number__icontains=search)
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

# Parse an Excel cell into one of the valid Intake choices.
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
                        alternate_mobile = get_column_value(
                            row,
                            [
                                "alternate_mobile_number",
                                "alternate_mobile",
                                "alternate_mobile_no",
                                "alternate_mobile_no.",
                                "alternate_phone",
                                "alternate_phone_number",
                                "alternate_contact_number",
                                "alternate_contact",
                            ]
                        )

                        # Split / de-duplicate / length-check every number.
                        mobile, alternate_mobile, mobile_errors, repeated = (
                            parse_mobile_numbers(mobile, alternate_mobile)
                        )

                        # The same number twice in one row: reject as a duplicate.
                        if repeated:
                            total_skipped += 1
                            duplicate_rows.append(
                                f"{full_name} \u2013 "
                                + "; ".join(
                                    describe_repeated_mobile(number)
                                    for _, number in repeated
                                )
                            )
                            continue

                        if mobile_errors:
                            for field_name, message in mobile_errors.items():
                                errors.append(
                                    f"{file.name} - Row {index + 2}: "
                                    f"{field_name}: {message}"
                                )
                            continue

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

                            "alternate_mobile_number": alternate_mobile,

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

                            "source_file": file.name,

                            "location": location,

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

                    reasons = []
                    if contact_index.email_exists(data["email"]):
                        reasons.append("Email already exists")
                    reasons.extend(
                        describe_mobile_conflict(number, owner)
                        for number, owner in contact_index.mobile_conflicts(
                            all_mobile_numbers(
                                data["mobile_number"],
                                data["alternate_mobile_number"],
                            )
                        )
                    )
                    if reasons:
                        total_skipped += 1
                        duplicate_rows.append(
                            f"{data['full_name']} \u2013 {'; '.join(reasons)}"
                        )
                        continue

                    contact_index.add(
                        data["email"],
                        data["mobile_number"],
                        data["alternate_mobile_number"],
                        data["full_name"],
                    )

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
            | Q(alternate_mobile_number__icontains=search)
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

# Reminder History: every reminder across all students, newest first, with filters.
IST = dt_timezone(timedelta(hours=5, minutes=30))


def _parse_day(value):
    try:
        return datetime.strptime(value or "", "%Y-%m-%d").date()
    except ValueError:
        return None


def _day_start(day):
    return datetime.combine(day, time.min, tzinfo=IST)


# Returns (start, end) for the chosen range; None means open-ended, end is exclusive.
def _history_date_bounds(params):
    today = timezone.now().astimezone(IST).date()
    one_day = timedelta(days=1)
    preset = params.get("date_range")

    if preset == "today":
        start, end = today, today + one_day
    elif preset == "yesterday":
        start, end = today - one_day, today
    elif preset == "week":
        start, end = today - timedelta(days=6), today + one_day
    elif preset == "custom":
        start = _parse_day(params.get("date_from"))
        last = _parse_day(params.get("date_to"))
        end = last + one_day if last else None
    else:
        return None, None

    return (_day_start(start) if start else None), (_day_start(end) if end else None)


# Status is computed from the clock (never stored), so it is turned into a query here.
def _reminder_status_q(status_name, now=None):
    now = now or timezone.now()
    open_reminder = Q(completed_at__isnull=True)
    due_from = now - StudentReminder.due_window()

    if status_name == StudentReminder.STATUS_COMPLETED:
        return Q(completed_at__isnull=False)
    if status_name == StudentReminder.STATUS_UPCOMING:
        return open_reminder & Q(remind_at__gt=now)
    if status_name == StudentReminder.STATUS_DUE:
        return open_reminder & Q(remind_at__lte=now, remind_at__gte=due_from)
    if status_name == StudentReminder.STATUS_OVERDUE:
        return open_reminder & Q(remind_at__lt=due_from)
    return None


def filter_reminder_history(queryset, params, include_status=True):
    search = (params.get("search") or "").strip()
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search)
            | Q(student__full_name__icontains=search)
            | Q(created_by__first_name__icontains=search)
            | Q(created_by__email__icontains=search)
        )

    start, end = _history_date_bounds(params)
    if start:
        queryset = queryset.filter(remind_at__gte=start)
    if end:
        queryset = queryset.filter(remind_at__lt=end)

    user_id = params.get("user")
    if user_id and user_id.isdigit():
        queryset = queryset.filter(created_by_id=int(user_id))

    if include_status:
        status_q = _reminder_status_q(params.get("status"))
        if status_q is not None:
            queryset = queryset.filter(status_q)

    return queryset


class ReminderHistoryListView(generics.ListAPIView):
    serializer_class = StudentReminderSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = filter_reminder_history(_reminders(), self.request.GET)
        return queryset.order_by("-remind_at", "-id")


# Card counts for the same filters, ignoring the status filter so the breakdown stays visible.
@api_view(["GET"])
def reminder_history_summary(request):
    queryset = filter_reminder_history(_reminders(), request.GET, include_status=False)
    now = timezone.now()

    counts = queryset.aggregate(
        total=Count("id"),
        **{
            name: Count("id", filter=_reminder_status_q(name, now))
            for name in (
                StudentReminder.STATUS_UPCOMING,
                StudentReminder.STATUS_DUE,
                StudentReminder.STATUS_OVERDUE,
                StudentReminder.STATUS_COMPLETED,
            )
        },
    )
    return Response(counts)


# Ids matching the current Reminder History filters, for "select all across pages".
@api_view(["GET"])
def reminder_history_ids(request):
    queryset = filter_reminder_history(_reminders(), request.GET)
    return Response({"ids": list(queryset.values_list("id", flat=True))})


class BulkDeleteRemindersAPIView(APIView):

    def delete(self, request):
        ids = request.data.get("ids", [])

        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "Provide a non-empty list of reminder ids to delete."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deleted_count, _ = StudentReminder.objects.filter(id__in=ids).delete()
        return Response({"success": True, "deleted_count": deleted_count})


# Users dropdown for the Reminder History filter.
@api_view(["GET"])
def reminder_history_users(request):
    users = get_user_model().objects.filter(is_active=True).order_by("first_name", "email")
    return Response({
        "results": [{"id": user.id, "name": _user_name(user) or user.get_username()} for user in users]
    })


class SearchFilterViewSet(viewsets.ModelViewSet):

    pagination_class = StandardPagination

    search_fields = ()         
    choice_search_fields = ()   
    exact_filters = ()         
    numeric_filters = ()       

    def get_queryset(self):
        queryset = self.queryset.all()
        params = self.request.query_params

        search = (params.get("search") or "").strip()
        if search:
            condition = Q()

            for field in self.search_fields:
                condition |= Q(**{f"{field}__icontains": search})

            for field in self.choice_search_fields:
                for value, label in self.queryset.model._meta.get_field(field).choices:
                    if search.lower() in label.lower():
                        condition |= Q(**{field: value})

            queryset = queryset.filter(condition)

        for field in self.exact_filters:
            value = params.get(field)
            if not value:
                continue
            if field in self.numeric_filters and not value.isdigit():
                continue
            queryset = queryset.filter(**{field: value})

        return queryset

    # Stamp created_by with the logged-in user's email, like Students.
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.email)

    # Ids matching the current search / filters, for "select all across pages".
    @action(detail=False, methods=["get"], url_path="ids")
    def ids(self, request):
        return Response({"ids": list(self.get_queryset().values_list("id", flat=True))})

    @action(detail=False, methods=["delete"], url_path="bulk-delete")
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])

        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "Provide a non-empty list of ids to delete."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deleted_count, _ = self.queryset.filter(id__in=ids).delete()
        return Response({"success": True, "deleted_count": deleted_count})


class UniversityViewSet(SearchFilterViewSet):
    queryset = University.objects.all().order_by("-created_at", "-id")
    serializer_class = UniversitySerializer

    search_fields = (
        "name",
        "phone_number",
        "email",
        "organisation_name",
        "designation",
    )


class PaymentViewSet(SearchFilterViewSet):
    queryset = Payment.objects.all().order_by("-created_at", "-id")
    serializer_class = PaymentSerializer

    search_fields = ("student_name", "university", "organization")
    choice_search_fields = ("intake", "payment_type", "status", "category")
    exact_filters = ("intake", "year", "payment_type", "status", "category")
    numeric_filters = ("year",)