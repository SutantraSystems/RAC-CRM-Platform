from django.db import models

class RACStudent(models.Model):
   
    # FULL NAME
    full_name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    # DATE OF BIRTH
    dob = models.DateField(
        null=True,
        blank=True
    )

    # MOBILE NUMBER
    mobile_number = models.CharField(
        max_length=15,
        db_index=True,
        null=True,
        blank=True
    )

    # EMAIL
    email = models.EmailField(
        db_index=True,
        null=True,
        blank=True
    )

    # PASSPORT DETAILS
    passport_number = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        db_index=True
    )

   
    # ACADEMIC DETAILS
    academic_details = models.TextField(
        null=True,
        blank=True,
        db_index=True
    )

    test_score = models.FloatField(
        null=True,
        blank=True
    )

   

    preferred_country = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True
    )

    # INTAKE DATE
    intake_date = models.DateField(
        null=True,
        blank=True
    )

    # BUDGET
    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    # WORK EXPERIENCE
    work_experience = models.TextField(
        null=True,
        blank=True
    )

    # ADDRESS
    address = models.TextField(
        null=True,
        blank=True
    )

    # PARENT NAME
    parent_name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    
    # TIMESTAMPS
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # meta class is used to configure the database table name and default ordering of records when queried. 
    class Meta:
        db_table = "rac_students"
        ordering = ['-created_at']

    
    # returns the full name of the student when the object is displayed in the admin UI.
    def __str__(self):
        return self.full_name