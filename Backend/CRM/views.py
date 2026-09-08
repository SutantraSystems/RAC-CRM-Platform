from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import RACStudent
from .serializers import RACStudentSerializer, RACStudentListSerializer
from .pagination import StandardPagination
import pandas as pd
from django.db.models import Q
from datetime import datetime

class RACStudentViewSet(viewsets.ModelViewSet):
    queryset = RACStudent.objects.all().order_by('-created_at')
    serializer_class = RACStudentSerializer
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return RACStudentListSerializer
        return RACStudentSerializer

    def get_queryset(self):
        queryset = RACStudent.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search')
        country = self.request.query_params.get('country')
        year = self.request.query_params.get('year')
        if search:
            queryset = queryset.filter(Q(full_name__icontains=search) | Q(email__icontains=search) | Q(mobile_number__icontains=search) | Q(passport_number__icontains=search) | Q(preferred_country__icontains=search) | Q(academic_details__icontains=search) | Q(work_experience__icontains=search) | Q(address__icontains=search) | Q(parent_name__icontains=search))
        if country:
            queryset = queryset.filter(preferred_country=country)
        if year:
            queryset = queryset.filter(intake_date__year=year)
        return queryset

def clean_value(value):
    if pd.isna(value):
        return None
    value = str(value).strip()
    if value.lower() in ['nan', 'none', 'null', '']:
        return None
    return value

def parse_date(value):
    if pd.isna(value):
        return None
    try:
        date_value = pd.to_datetime(value, errors='coerce')
        if pd.isna(date_value):
            return None
        return date_value.date()
    except Exception:
        return None

def parse_test_score(value):
    if pd.isna(value):
        return None
    try:
        return float(value)
    except Exception:
        return None

def parse_budget(value):
    if pd.isna(value):
        return None
    try:
        value = str(value).replace(',', '').strip()
        return float(value)
    except Exception:
        return None

def get_column_value(row, possible_names):
    for col in possible_names:
        value = row.get(col)
        if pd.notna(value) and str(value).strip():
            return value
    return None

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


class RACStudentViewSet(viewsets.ModelViewSet):
    queryset = RACStudent.objects.all().order_by("-created_at")
    serializer_class = RACStudentSerializer
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action == "list":
            return RACStudentListSerializer
        return RACStudentSerializer

    def get_queryset(self):
        queryset = RACStudent.objects.all().order_by("-created_at")

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


def clean_value(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    if value.lower() in ["nan", "none", "null", ""]:
        return None

    return value


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


def parse_test_score(value):
    if pd.isna(value):
        return None

    try:
        return float(value)

    except Exception:
        return None


def parse_budget(value):
    if pd.isna(value):
        return None

    try:
        value = str(value).replace(",", "").strip()
        return float(value)

    except Exception:
        return None


def get_column_value(row, possible_names):
    for column in possible_names:
        value = row.get(column)

        if pd.notna(value) and str(value).strip():
            return value

    return None


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


@api_view(["GET"])
def student_count(request):
    queryset = RACStudent.objects.all()

    country = request.GET.get("country")
    year = request.GET.get("year")

    if country:
        queryset = queryset.filter(
            preferred_country=country
        )

    if year:
        queryset = queryset.filter(
            intake_date__year=year
        )

    return Response(
        {
            "total_students": queryset.count()
        }
    )

@api_view(['GET'])
def student_count(request):
    queryset = RACStudent.objects.all()
    country = request.GET.get('country')
    year = request.GET.get('year')
    status = request.GET.get('status')
    if country:
        queryset = queryset.filter(preferred_country=country)
    if status:
        queryset = queryset.filter(status=status)
    if year:
        queryset = queryset.filter(intake_date__year=year)
    return Response({'total_students': queryset.count()})
