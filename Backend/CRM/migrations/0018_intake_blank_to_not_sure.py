from django.db import migrations, models
from django.db.models import Q

from CRM.deduplication import DUPLICATE_CHECK_FIELDS, build_dedup_hash


def blank_intake_to_not_sure(apps, schema_editor):
    """Every student with no intake (NULL or empty) becomes "Not Sure"."""
    RACStudent = apps.get_model("CRM", "RACStudent")

    # Students already saved as "not_sure" have a hash built from "not_sure".
    # The hash now treats "not_sure" like a blank intake, so refresh those.
    already_not_sure = list(RACStudent.objects.filter(intake="not_sure"))

    RACStudent.objects.filter(
        Q(intake__isnull=True) | Q(intake="")
    ).update(intake="not_sure")

    for student in already_not_sure:
        new_hash = build_dedup_hash(
            {field: getattr(student, field) for field in DUPLICATE_CHECK_FIELDS}
        )

        if new_hash == student.dedup_hash:
            continue

        # dedup_hash is unique: leave the old hash if another student has it.
        if RACStudent.objects.filter(dedup_hash=new_hash).exclude(pk=student.pk).exists():
            continue

        RACStudent.objects.filter(pk=student.pk).update(dedup_hash=new_hash)


class Migration(migrations.Migration):

    dependencies = [
        ("CRM", "0016_studentreminder"),
    ]

    operations = [
        migrations.AlterField(
            model_name="racstudent",
            name="intake",
            field=models.CharField(
                blank=True,
                choices=[
                    ("fall", "Fall"),
                    ("winter", "Winter"),
                    ("spring", "Spring"),
                    ("not_sure", "Not Sure"),
                ],
                default="not_sure",
                max_length=20,
                null=True,
            ),
        ),
        # Cannot be undone: the original NULLs are indistinguishable from
        # students who were deliberately set to "Not Sure".
        migrations.RunPython(blank_intake_to_not_sure, migrations.RunPython.noop),
    ]