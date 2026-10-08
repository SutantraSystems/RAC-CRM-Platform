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
    values = []
    for field in DUPLICATE_CHECK_FIELDS:
        value = normalize_for_comparison(data.get(field))

        # A blank intake is stored as "not_sure"
        if field == "intake" and value == "not_sure":
            value = None

        values.append(value)
    canonical_value = json.dumps(
        values,
        ensure_ascii=False,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical_value.encode("utf-8")).hexdigest()

# Unique email / unique mobile number, stripped + lower-cased
def normalize_email(value):
    return normalize_for_comparison(value) 

def normalize_mobile(value):
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
        self.mobiles = {}  # normalized number -> owner's name

    @classmethod
    def from_queryset(cls, queryset):
        index = cls()
        for email, mobile, alternate, name in queryset.values_list(
            "email", "mobile_number", "alternate_mobile_number", "full_name"
        ):
            index.add(email, mobile, alternate, name)
        return index

    def add(self, email, mobile, alternate=None, name=None):
        e = normalize_email(email)
        if e:
            self.emails.add(e)

        owner = (str(name).strip() if name else "") or "Unnamed Student"
        for number in all_mobile_numbers(mobile, alternate):
            m = normalize_mobile(number)
            if m:
                self.mobiles.setdefault(m, owner)

    def email_exists(self, email):
        e = normalize_email(email)
        return e is not None and e in self.emails

    def mobile_exists(self, mobile):
        m = normalize_mobile(mobile)
        return m is not None and m in self.mobiles

    def mobile_conflicts(self, numbers):
        """[(number, owner name)] for every given number that already exists."""
        conflicts = []
        for number in numbers:
            m = normalize_mobile(number)
            if m is not None and m in self.mobiles:
                conflicts.append((number, self.mobiles[m]))
        return conflicts


MOBILE_NUMBER_MAX_LENGTH = 15  # same limit as RACStudent.mobile_number
_MOBILE_SEPARATORS = re.compile(r"[,;\r\n]+")

def split_mobile_numbers(value):
    """Split one cell / field into cleaned numbers.
    Numbers may be separated by comma, semicolon or new line. Each number keeps
    only digits and '+'. Pieces without any digit are dropped.
    """
    text = normalize_for_comparison(value)
    if text is None:
        return []

    numbers = []
    for part in _MOBILE_SEPARATORS.split(text):
        number = re.sub(r"[^\d+]", "", part)
        if re.search(r"\d", number):
            numbers.append(number)
    return numbers

def all_mobile_numbers(mobile, alternate=None):
    """Every number a student holds: the primary first, then the alternates."""
    numbers = split_mobile_numbers(mobile) + split_mobile_numbers(alternate)
    return numbers

def describe_mobile_conflict(number, owner):
    return f"Mobile number {number} already exists for {owner}"

def describe_repeated_mobile(number):
    return f"Mobile number {number} appears more than once"

def parse_mobile_numbers(mobile_value, alternate_value=None):
    
    errors = {}
    repeated = []
    seen = set()
    numbers = []  # (source field, number), in order

    for field, raw in (
        ("mobile_number", mobile_value),
        ("alternate_mobile_number", alternate_value),
    ):
        for number in split_mobile_numbers(raw):
            if len(number) > MOBILE_NUMBER_MAX_LENGTH:
                errors.setdefault(field, []).append(
                    f"'{number}' is {len(number)} characters but maximum "
                    f"allowed is {MOBILE_NUMBER_MAX_LENGTH} per number."
                )
                continue

            key = normalize_mobile(number)
            if key in seen:
                repeated.append((field, number))
                continue
            seen.add(key)
            numbers.append((field, number))

    if errors or repeated:
        return (
            None,
            None,
            {field: " ".join(msgs) for field, msgs in errors.items()},
            repeated,
        )

    mobile_number = None
    if numbers and numbers[0][0] == "mobile_number":
        mobile_number = numbers.pop(0)[1]

    alternates = ", ".join(number for _, number in numbers) or None
    return mobile_number, alternates, {}, []