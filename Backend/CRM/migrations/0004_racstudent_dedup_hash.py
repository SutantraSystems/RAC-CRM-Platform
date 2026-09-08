from django.db import migrations, models
import hashlib
import json
from datetime import date, datetime
from decimal import Decimal


DUPLICATE_CHECK_FIELDS = [
    "full_name", "dob", "mobile_number", "email", "passport_number",
    "academic_details", "test_score", "preferred_country", "intake_date",
    "budget", "work_experience", "address", "parent_name",
]


def normalize(value):
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
        if value != value:
            return None
        if value.is_integer():
            return str(int(value))
        return str(value).strip()
    value = str(value).strip()
    if not value or value.lower() in {"nan", "none", "null"}:
        return None
    return value.lower()


def calculate_hash(student):
    values = [normalize(getattr(student, field)) for field in DUPLICATE_CHECK_FIELDS]
    payload = json.dumps(values, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def populate_hashes(apps, schema_editor):
    RACStudent = apps.get_model("CRM", "RACStudent")
    seen = set()

    for student in RACStudent.objects.all().iterator():
        row_hash = calculate_hash(student)
        if row_hash in seen:
            raise RuntimeError(
                "Duplicate student records already exist. "
                "Remove existing exact duplicates before applying migration 0004."
            )
        seen.add(row_hash)
        student.dedup_hash = row_hash
        student.save(update_fields=["dedup_hash"])


class Migration(migrations.Migration):

    dependencies = [
        ("CRM", "0003_alter_racstudent_email_alter_racstudent_full_name_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="racstudent",
            name="dedup_hash",
            field=models.CharField(
                max_length=64,
                unique=True,
                db_index=True,
                editable=False,
                null=True,
            ),
        ),
        migrations.RunPython(populate_hashes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="racstudent",
            name="dedup_hash",
            field=models.CharField(
                max_length=64,
                unique=True,
                db_index=True,
                editable=False,
            ),
        ),
    ]
