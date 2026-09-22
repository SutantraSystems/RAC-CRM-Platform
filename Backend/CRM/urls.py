from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RACStudentViewSet, UploadStudentsAPIView, student_count,BulkDeleteStudentsAPIView,student_ids, StudentDocumentListCreateView, StudentDocumentDeleteView, StudentCommentListCreateView, StudentCommentDetailView

router = DefaultRouter()

# Routes for the student CRUD operations.
router.register(
    r"students",
    RACStudentViewSet,
    basename="students"
)

urlpatterns = [
    path("students/count/", student_count),
    path("students/ids/", student_ids),

    # Route for uploading student data in bulk via an API endpoint.
    path("students/upload/", UploadStudentsAPIView.as_view(), name="upload-students"),    
    path("students/bulk-delete/", BulkDeleteStudentsAPIView.as_view(), name="bulk-delete-students"),
    path("students/<int:student_id>/documents/", StudentDocumentListCreateView.as_view(), name="student-documents"),
    path("students/documents/<int:pk>/", StudentDocumentDeleteView.as_view(), name="student-document-detail"),
    path("students/<int:student_id>/comments/", StudentCommentListCreateView.as_view(), name="student-comments"),
    path("students/comments/<int:pk>/", StudentCommentDetailView.as_view(), name="student-comment-detail"),

    # Includes the automatically generated routes from the router for the student CRUD operations.
    path("", include(router.urls)),
   
    
]




