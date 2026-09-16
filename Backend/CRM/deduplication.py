import hashlib
import json
from datetime import date, datetime
from decimal import Decimal

DUPLICATE_CHECK_FIELDS = [
    "full_name",
    "dob",
    "mobile_number",
    "email",
    "passport_number",
    "academic_details",
    "test_score",
    "preferred_country",
    "intake_date",
    "budget",
    "work_experience",
    "address",
    "parent_name",
]


def normalize_for_comparison(value):
    if value is None:
        return None

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    if isinstance(value, Decimal):
        value = format(value, "f")
        if "." in value:
            value = value.rstrip("0").rstrip(".")
        return value

    if isinstance(value, float):
        if value != value:  # NaN
            return None
        if value.is_integer():
            return str(int(value))
        return str(value).strip()

    value = str(value).strip()
    if not value or value.lower() in {"nan", "none", "null"}:
        return None

    return value.lower()

def build_dedup_hash(data):
    values = [
        normalize_for_comparison(data.get(field))
        for field in DUPLICATE_CHECK_FIELDS
    ]
    canonical_value = json.dumps(
        values,
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical_value.encode("utf-8")).hexdigest()

