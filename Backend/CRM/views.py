from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import RACStudent
from .serializers import (
    RACStudentSerializer,
    RACStudentListSerializer
)
from .pagination import StandardPagination
import pandas as pd
from django.db.models import Q
from datetime import datetime

# ViewSet for handling CRUD operations on RACStudent model with filtering and pagination.
class RACStudentViewSet(viewsets.ModelViewSet):

    queryset = RACStudent.objects.all().order_by("-created_at")
    serializer_class = RACStudentSerializer
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action == "list":
            return RACStudentListSerializer
        return RACStudentSerializer
    
    # Filter of student table in students.jsx
    def get_queryset(self):
        queryset = RACStudent.objects.all().order_by("-created_at")

        search = self.request.query_params.get("search")
        country = self.request.query_params.get("country")
        year = self.request.query_params.get("year")

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(mobile_number__icontains=search) |
                Q(passport_number__icontains=search) |
                Q(preferred_country__icontains=search) |
                Q(academic_details__icontains=search) |
                Q(work_experience__icontains=search) |
                Q(address__icontains=search) |
                Q(parent_name__icontains=search)
            )

        if country:
            queryset = queryset.filter(preferred_country=country)
        if year:
            queryset = queryset.filter(intake_date__year=year)

        return queryset

# Utility functions for cleaning and parsing data from the uploaded Excel file.
def clean_value(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    if value.lower() in ["nan", "none", "null", ""]:
        return None

    return value

# Parses date values from the uploaded Excel file, handles varoius formats(date) or null objects.
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


#handles format for test score
def parse_test_score(value):
    if pd.isna(value):
        return None

    try:
        return float(value)
    except Exception:
        return None

#handles format for budget
def parse_budget(value):
    if pd.isna(value):
        return None

    try:
        value = str(value).replace(",", "").strip()
        return float(value)
    except Exception:
        return None

# handles and accpets all similar type of column name(mobile,mobile_no)
def get_column_value(row, possible_names):
    for col in possible_names:
        value = row.get(col)

        if pd.notna(value) and str(value).strip():
            return value

    return None


# API View for Excel Uplaod                       

UPDATE_FIELDS = [
    "full_name", "dob", "mobile_number",
    "academic_details", "test_score", "preferred_country",
    "intake_date", "budget", "work_experience",
    "address", "parent_name", "updated_at"
]

UPDATE_FIELDS = [
    "full_name", "dob", "mobile_number",
    "academic_details", "test_score", "preferred_country",
    "intake_date", "budget", "work_experience",
    "address", "parent_name", "updated_at"
]


def find_best_match(data, existing_by_email, existing_by_mobile):
    """
    Match by email (2pts) or mobile (1pt).
    Returns best matching student or None.
    """
    scores = {}

    if data["email"]:
        match = existing_by_email.get(data["email"])
        if match:
            scores[match.pk] = (
                scores.get(match.pk, (0, match))[0] + 2, match
            )

    if data["mobile_number"]:
        match = existing_by_mobile.get(data["mobile_number"])
        if match:
            scores[match.pk] = (
                scores.get(match.pk, (0, match))[0] + 1, match
            )

    if not scores:
        return None

    best_pk = max(scores, key=lambda pk: scores[pk][0])
    return scores[best_pk][1]


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
            total_updated  = 0
            total_rows     = 0
            total_errors   = []

            for file in files:

                # Read & Normalize 
                df = pd.read_excel(file)

                df.columns = (
                    df.columns
                    .str.strip()
                    .str.lower()
                    .str.replace(" ", "_", regex=False)
                )

                total_rows += len(df)
                errors      = []
                parsed_rows = []

                #  Parse All Rows 
                for index, row in df.iterrows():
                    try:

                        full_name = clean_value(row.get("full_name"))

                        if not full_name:
                            full_name = f"Student {index + 1}"

                        email = clean_value(
                            get_column_value(row, [
                                "email", "email_id",
                                "email_address", "mail"
                            ])
                        )

                        mobile = clean_value(
                            get_column_value(row, [
                                "mobile_number", "mobile",
                                "mobile_no",     "mobile_no.",
                                "phone",         "phone_number",
                                "contact_number","contact"
                            ])
                        )

                        data = {
                            "full_name":    full_name,
                            "email":        email.lower() if email else None,
                            "mobile_number": mobile,

                            "dob": parse_date(
                                row.get("dob")
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
                        }

                        parsed_rows.append((index, data))

                    except Exception as e:
                        errors.append(
                            f"{file.name} - Row {index + 2}: {str(e)}"
                        )

                #  Deduplicate Within File 
                # Priority: email first, then mobile
                # Rows with neither → always insert as new
                seen_email  = {}
                seen_mobile = {}
                unique_rows = []

                for index, data in parsed_rows:

                    email  = data["email"]
                    mobile = data["mobile_number"]

                    if email and email in seen_email:
                        # Duplicate email in file → last row wins
                        seen_email[email] = (index, data)

                    elif mobile and mobile in seen_mobile:
                        # Duplicate mobile in file → last row wins
                        seen_mobile[mobile] = (index, data)

                    else:
                        # First time seeing this row
                        if email:
                            seen_email[email] = (index, data)
                        if mobile:
                            seen_mobile[mobile] = (index, data)
                        unique_rows.append((index, data))

                #  Collect Lookup Values 
                emails  = [
                    data["email"]
                    for _, data in unique_rows
                    if data["email"]
                ]

                mobiles = [
                    data["mobile_number"]
                    for _, data in unique_rows
                    if data["mobile_number"]
                ]

                #  2 Bulk DB Lookups 
                existing_by_email = {
                    s.email.lower(): s
                    for s in RACStudent.objects.filter(
                        email__in=emails
                    )
                } if emails else {}

                existing_by_mobile = {
                    s.mobile_number: s
                    for s in RACStudent.objects.filter(
                        mobile_number__in=mobiles
                    )
                } if mobiles else {}

                #  Split Insert vs Update 
                to_insert = []
                to_update = []

                for index, data in unique_rows:
                    try:

                        student = find_best_match(
                            data,
                            existing_by_email,
                            existing_by_mobile
                        )

                        if student:
                            # Update existing student
                            for field, value in data.items():
                                setattr(student, field, value)
                            to_update.append(student)

                        else:
                            # Insert new student
                            to_insert.append(RACStudent(**data))

                    except Exception as e:
                        errors.append(
                            f"{file.name} - Row {index + 2}: {str(e)}"
                        )

                #  Bulk Insert 
                if to_insert:
                    RACStudent.objects.bulk_create(
                        to_insert,
                        ignore_conflicts=True
                    )

                #  Bulk Update
                if to_update:
                    RACStudent.objects.bulk_update(
                        to_update,
                        UPDATE_FIELDS
                    )

                total_inserted += len(to_insert)
                total_updated  += len(to_update)
                total_errors.extend(errors)

            return Response(
                {
                    "success":        True,
                    "files_uploaded": len(files),
                    "total_rows":     total_rows,
                    "inserted":       total_inserted,
                    "updated":        total_updated,
                    "failed":         len(total_errors),
                    "errors":         total_errors
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# filter based on country, year and status in dashboard
@api_view(["GET"])
def student_count(request):

    queryset = RACStudent.objects.all()

    country = request.GET.get("country")
    year = request.GET.get("year")
    status = request.GET.get("status")

    if country:
        queryset = queryset.filter(preferred_country=country)

    if status:
        queryset = queryset.filter(status=status)

    if year:
        queryset = queryset.filter(intake_date__year=year)

    return Response({
        "total_students": queryset.count()
    })


