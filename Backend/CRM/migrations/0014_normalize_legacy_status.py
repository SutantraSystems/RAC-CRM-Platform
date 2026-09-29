from django.db import migrations

# Every status value the app understands today.
VALID = [
    'not_interested', 'interested', 'not_sure', 'shortlisting_done',
    'docs_shared', 'applied', 'deposit_paid', 'visa_granted',
]


def forwards(apps, schema_editor):
    RACStudent = apps.get_model('CRM', 'RACStudent')

    # Old two-status system, from before the 8-stage pipeline existed.
    RACStudent.objects.filter(status='active').update(status='interested')
    RACStudent.objects.filter(status='inactive').update(status='not_interested')

    # Anything else that isn't a valid status (blank, null, a stray value) -> Not Sure.
    RACStudent.objects.exclude(status__in=VALID).update(status='not_sure')


def backwards(apps, schema_editor):
    # One-way cleanup; nothing meaningful to reverse.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('CRM', '0013_alter_racstudent_status'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]