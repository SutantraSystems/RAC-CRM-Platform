from datetime import datetime

import pandas as pd
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .deduplication import build_dedup_hash
from .models import RACStudent
from .pagination import StandardPagination
from .serializers import RACStudentListSerializer, RACStudentSerializer

from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import RACStudent, StudentDocument, StudentComment, StudentActivity
from .serializers import (
    RACStudentListSerializer,
    RACStudentSerializer,
    StudentDocumentSerializer,
    StudentCommentSerializer,
    StudentActivitySerializer,
)

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

    # Apply search/country/year filters on top of the base queryset.
    def get_queryset(self):
        queryset = RACStudent.objects.all().order_by("-created_at","-id")

        search = self.request.query_params.get("search")
        country = self.request.query_params.get("country")
        year = self.request.query_params.get("year")

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

        if year:
            queryset = queryset.filter(
                intake_date__year=year
            )
        return queryset

    # Stamp created_by with the logged-in user's email on manual "Add Student".
    def perform_create(self, serializer):
        student = serializer.save(created_by=self.request.user.email)
        log_activity(
            student, self.request.user, "created",
            f"Student record created by {self.request.user.email}."
        )

    def perform_update(self, serializer):
        student = serializer.save()
        log_activity(
            student, self.request.user, "updated",
            f"Student details updated by {self.request.user.email}."
        )

# Turn an Excel cell into a clean string, or None if it's blank/NaN.
def clean_value(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    if value.lower() in ["nan", "none", "null", ""]:
        return None
    return value

# Writes one audit-trail row every time something notable happens to a student.
def log_activity(student, user, action, description):
    StudentActivity.objects.create(
        student=student,
        user=user,
        action=action,
        description=description,
    )
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

# Return the first non-empty value found under any of the given column names.
def get_column_value(row, possible_names):
    for column in possible_names:
        value = row.get(column)

        if pd.notna(value) and str(value).strip():
            return value
    return None

# Bulk-imports students from one or more uploaded Excel/CSV files.
class UploadStudentsAPIView(APIView):

    def post(self, request):
        files = request.FILES.getlist("files")

        if not files:
            return Response(
                {
                    "error": "No files uploaded"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            total_inserted = 0
            total_skipped = 0
            total_rows = 0
            total_errors = []

            for file in files:
                df = pd.read_excel(file)

                df.columns = (
                    df.columns
                    .str.strip()
                    .str.lower()
                    .str.replace(" ", "_", regex=False)
                )

                total_rows += len(df)

                errors = []
                parsed_rows = []

                for index, row in df.iterrows():

                    try:

                        full_name = clean_value(
                            row.get("full_name")
                        )

                        if not full_name:
                            errors.append(
                                f"{file.name} - Row {index + 2}: "
                                "Full name is required."
                            )
                            continue

                        email = clean_value(
                            get_column_value(
                                row,
                                [
                                    "email",
                                    "email_id",
                                    "email_address",
                                    "mail",
                                ]
                            )
                        )

                        if email:
                            email = email.lower()

                        mobile = clean_value(
                            get_column_value(
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
                        )

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

                            "intake_date": parse_date(
                                row.get("intake_date")
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
                        }

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
                        continue

                    rows_seen.add(dedup_hash)

                    if RACStudent.objects.filter(
                        dedup_hash=dedup_hash
                    ).exists():
                        total_skipped += 1
                        continue

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

                total_errors.extend(errors)

            return Response(
                {
                    "success": True,
                    "files_uploaded": len(files),
                    "total_rows": total_rows,
                    "inserted": total_inserted,
                    "skipped_duplicates": total_skipped,
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

# Returns a count of students matching optional country/status/year filters.
@api_view(["GET"])
def student_count(request):
    queryset = RACStudent.objects.all()

    country = request.GET.get("country")
    year = request.GET.get("year")
    status_param = request.GET.get("status")

    if country:
        queryset = queryset.filter(preferred_country=country)

    if status_param:
        queryset = queryset.filter(status=status_param)

    if year:
        queryset = queryset.filter(intake_date__year=year)

    return Response(
        {
            "total_students": queryset.count()
        }
    )

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
        document = serializer.save(
            student=student,
            uploaded_by=self.request.user,
        )
        log_activity(
            student, self.request.user, "document_uploaded",
            f"{self.request.user.email} uploaded a document"
            f"{f' ({document.document_type})' if document.document_type else ''}."
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
        log_activity(
            student, self.request.user, "comment_added",
            f"{self.request.user.email} added a comment."
        )

# Comments — edit/delete. 
class StudentCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudentCommentSerializer

    def get_queryset(self):
        return StudentComment.objects.filter(user=self.request.user)

# Activity — read-only audit trail for a specific student.
class StudentActivityListView(generics.ListAPIView):
    serializer_class = StudentActivitySerializer

    def get_queryset(self):
        return StudentActivity.objects.filter(
            student_id=self.kwargs["student_id"]
        )

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
    year = request.GET.get("year")

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

    if year:
        queryset = queryset.filter(intake_date__year=year)

    ids = list(queryset.values_list("id", flat=True))

    return Response({"ids": ids})