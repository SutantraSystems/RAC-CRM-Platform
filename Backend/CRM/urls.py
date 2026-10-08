from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (RACStudentViewSet, UploadStudentsAPIView, student_count,BulkDeleteStudentsAPIView,student_ids, StudentDocumentListCreateView,
StudentDocumentDeleteView, StudentCommentListCreateView, StudentCommentDetailView, student_status_summary,student_locations,student_source_files,
StudentReminderListCreateView, StudentReminderDetailView,reminder_complete, reminder_reschedule, reminder_notifications,UniversityViewSet, PaymentViewSet
)

router = DefaultRouter()

# Routes for the student CRUD operations.
router.register(r"students",RACStudentViewSet,basename="students")

# Routes for  Universities and Payments (list, create, retrieve, update, delete).
router.register(r"universities", UniversityViewSet, basename="universities")
router.register(r"payments", PaymentViewSet, basename="payments")


urlpatterns = [
    path("students/count/", student_count),
    path("students/status-summary/", student_status_summary),
    path("students/ids/", student_ids),
    path("students/locations/", student_locations),
    path("students/source-files/", student_source_files),


    # Route for uploading student data in bulk via an API endpoint.
    path("students/upload/", UploadStudentsAPIView.as_view(), name="upload-students"),    
    path("students/bulk-delete/", BulkDeleteStudentsAPIView.as_view(), name="bulk-delete-students"),
    path("students/<int:student_id>/documents/", StudentDocumentListCreateView.as_view(), name="student-documents"),
    path("students/documents/<int:pk>/", StudentDocumentDeleteView.as_view(), name="student-document-detail"),
    path("students/<int:student_id>/comments/", StudentCommentListCreateView.as_view(), name="student-comments"),
    path("students/comments/<int:pk>/", StudentCommentDetailView.as_view(), name="student-comment-detail"),

    # Reminders (shared by everyone in RAC). Keep separate from comments.
    path("students/<int:student_id>/reminders/", StudentReminderListCreateView.as_view(), name="student-reminders"),
    path("students/reminders/notifications/", reminder_notifications, name="reminder-notifications"),
    path("students/reminders/<int:pk>/", StudentReminderDetailView.as_view(), name="student-reminder-detail"),
    path("students/reminders/<int:pk>/complete/", reminder_complete, name="student-reminder-complete"),
    path("students/reminders/<int:pk>/reschedule/", reminder_reschedule, name="student-reminder-reschedule"),


    
    # Includes the automatically generated routes from the router for the student CRUD operations.
    path("", include(router.urls)),
   
    
]