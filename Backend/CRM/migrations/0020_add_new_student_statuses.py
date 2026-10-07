from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('CRM', '0019_merge_20261006_1658'),
    ]

    operations = [
        migrations.AlterField(
            model_name='racstudent',
            name='status',
            field=models.CharField(
                choices=[
                    ('not_interested', 'Not Interested'),
                    ('interested', 'Interested'),
                    ('not_sure', 'Not Sure'),
                    ('shortlisting_done', 'Shortlisting Done'),
                    ('docs_shared', 'Docs Shared'),
                    ('applied', 'Applied'),
                    ('deposit_paid', 'Deposit Paid'),
                    ('visa_granted', 'Visa Granted'),
                    ('future_intake', 'Future Intake'),
                    ('prm_prospect', 'PRM Prospect'),
                    ('no_response', 'No Response'),
                    ('invalid_number', 'Invalid Number'),
                ],
                db_index=True,
                default='not_sure',
                max_length=20,
            ),
        ),
    ]