import hashlib
import json
import re
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
    "intake",
    "year",
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

#Create a unique value based on the student's duplicate-check fields.
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

# Unique email / unique mobile number
def normalize_email(value):
    return normalize_for_comparison(value)  # stripped + lower-cased

def normalize_mobile(value):
    """Digits only, last 10 digits, so '+91 98765-43210' == '9876543210'."""
    value = normalize_for_comparison(value)
    if value is None:
        return None
    digits = re.sub(r"\D", "", value)
    if not digits:
        return None
    return digits[-10:]

class ContactIndex:
    """In-memory index of existing emails and mobile numbers."""

    def __init__(self):
        self.emails = set()
        self.mobiles = set()

    @classmethod
    def from_queryset(cls, queryset):
        index = cls()
        for email, mobile in queryset.values_list("email", "mobile_number"):
            index.add(email, mobile)
        return index

    def add(self, email, mobile):
        e, m = normalize_email(email), normalize_mobile(mobile)
        if e:
            self.emails.add(e)
        if m:
            self.mobiles.add(m)

    def email_exists(self, email):
        e = normalize_email(email)
        return e is not None and e in self.emails

    def mobile_exists(self, mobile):
        m = normalize_mobile(mobile)
        return m is not None and m in self.mobiles