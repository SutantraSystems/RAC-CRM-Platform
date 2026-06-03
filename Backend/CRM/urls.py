from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RACStudentViewSet, UploadStudentsAPIView, student_count


router = DefaultRouter()

# Routes for the student CRUD operations.
router.register(
    r"students",
    RACStudentViewSet,
    basename="students"
)

urlpatterns = [
    # Includes the automatically generated routes from the router for the student CRUD operations.
    path("", include(router.urls)),
    # Route for uploading student data in bulk via an API endpoint.
    path(
        "upload-students/",
        UploadStudentsAPIView.as_view(),
        name="upload-students"
    ),
    # Route for getting the count of students in the database.
     path("students-count/", student_count),  
]




