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
    path("students/count/", student_count),

    # Route for uploading student data in bulk via an API endpoint.
    path("students/upload/", UploadStudentsAPIView.as_view(), name="upload-students"),    
    
    # Includes the automatically generated routes from the router for the student CRUD operations.
    path("", include(router.urls)),
   
    
]




