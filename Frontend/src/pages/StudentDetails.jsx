import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import {
  getStudentById,
  updateStudentStatus,
  updateStudent,
  deleteStudent,
} from "../services/studentApi";
import StudentForm from "../components/forms/StudentForm";
import { getStatusLabel, STAGE_VALUES } from "../data/students";
import Toast from "../components/ui/Toast";
import OverviewTab from "../components/studentDetails/OverviewTab";
import DocumentsTab from "../components/studentDetails/DocumentsTab";
import CommentsTab from "../components/studentDetails/CommentsTab";
import RemindersTab from "../components/studentDetails/RemindersTab";

const TABS = ["Overview", "Documents", "Comments", "Reminders"];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // The Students list URL (with ?page=&country=...) this page was opened from. Missing when the page is opened directly, in which case plain /students.
  const fromList =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/students")
      ? location.state.from
      : "/students";

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // The tab lives in the URL (?tab=Reminders) so the navbar bell can open the Reminders tab directly, and a refresh keeps the same tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get("tab") || "").toLowerCase();
  const activeTab = TABS.find((t) => t.toLowerCase() === tabParam) || "Overview";
  const setActiveTab = (tab) =>
    setSearchParams(tab === "Overview" ? {} : { tab }, {
      replace: true,
      state: location.state,
    });
  const [toast, setToast] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Save edits from the modal. Returns { field: message } when the server rejects duplicate email / mobile.
  const handleSaveEdit = async (formData) => {
    try {
      const response = await updateStudent(student.id, formData);
      setStudent(response.data);
      setShowEdit(false);
      setToast({ type: "success", message: "Student updated successfully!" });
    } catch (err) {
      console.error("Save failed:", err);
      const data = err.response?.data;
      const fieldErrors = {};
      ["email", "mobile_number"].forEach((key) => {
        if (data?.[key]) {
          fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
        }
      });
      const first = data && Object.keys(data)[0];
      const raw = first ? data[first] : null;
      const msg = Array.isArray(raw) ? raw[0] : raw;
      setToast({
        type: "error",
        message:
          typeof data?.detail === "string"
            ? data.detail
            : typeof msg === "string"
            ? msg
            : "Failed to save student. Please check the form and try again.",
      });
      return fieldErrors;
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteStudent(student.id);
      navigate(fromList);
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({
        type: "error",
        message: "Failed to delete student. Please try again.",
      });
      setDeleting(false);
      setShowDelete(false);
    }
  };

  // Save a new status / stage. Updates the screen straight away, then rolls back if the server rejects it.
  const handleStatusChange = async (newStatus) => {
    const previous = student.status || "not_sure";
    if (newStatus === previous) return;

    // "Not Interested" / "Not Sure" can always be chosen. Pipeline stages must follow the order: from outside the pipeline only the first stage can be picked, inside it only the next stage.
    if (newStatus !== "not_interested" && newStatus !== "not_sure") {
      const currentIndex = STAGE_VALUES.indexOf(previous);
      const newIndex = STAGE_VALUES.indexOf(newStatus);
      const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;

      if (newIndex !== nextIndex) {
        setToast({
          type: "error",
          message:
            newIndex < nextIndex
              ? `${getStatusLabel(newStatus)} stage is already completed.`
              : `Please complete the ${getStatusLabel(
                  STAGE_VALUES[nextIndex]
                )} stage first.`,
        });
        return;
      }
    }
    setStudent((prev) => ({ ...prev, status: newStatus }));

    try {
      await updateStudentStatus(student.id, newStatus);
      setToast({
        type: "success",
        message: `Status updated to ${getStatusLabel(newStatus)}.`,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      setStudent((prev) => ({ ...prev, status: previous }));
      setToast({
        type: "error",
        message: "Failed to update status. Please try again.",
      });
    }
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getStudentById(id);
        setStudent(response.data);
      } catch (err) {
        console.error("Failed to load student:", err);
        setError("Could not load this student. They may have been deleted.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400">Loading student...</div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">{error || "Student not found."}</p>
        <button onClick={() => navigate(fromList)} className="btn-outline">
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <button
        onClick={() => navigate(fromList)}
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={15} />
        Back to Students
      </button>

      <div className="pt-2 pb-1 min-w-0">

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-slate-800 tracking-tight break-words">
              {student.full_name || "Unnamed Student"}
            </h1>

          </div>
        </div>
      </div>



      <div className="bg-white rounded-2xl shadow-card min-w-0">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 sm:px-4">
          <div className="flex min-w-0 overflow-x-auto overscroll-x-contain">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab}
            </button>
          ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              title="Edit Student"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
            >
              <Edit2 size={14} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              title="Delete Student"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-danger hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          {activeTab === "Overview" && <OverviewTab student={student} onStatusChange={handleStatusChange} />}
          {activeTab === "Documents" && (
            <DocumentsTab studentId={student.id} setToast={setToast} />
          )}
          {activeTab === "Comments" && (
            <CommentsTab studentId={student.id} setToast={setToast} />
          )}
          {activeTab === "Reminders" && (
            <RemindersTab studentId={student.id} setToast={setToast} />
          )}
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center gap-2 px-4 sm:px-5 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-base font-semibold text-slate-800">Edit Student</h2>
              <button
                onClick={() => setShowEdit(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <StudentForm
                initialData={student}
                onSubmit={handleSaveEdit}
                onCancel={() => setShowEdit(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 sm:px-6 py-4">
              <h3 className="text-base font-semibold text-slate-800">Delete Student?</h3>
              <button
                onClick={() => !deleting && setShowDelete(false)}
                disabled={deleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                ✕
              </button>
            </div>
            <div className="px-4 sm:px-6 py-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={18} className="text-danger" />
              </div>
              <p className="text-sm font-medium text-slate-700 break-words">
                Are you sure you want to delete {student.full_name || "this student"}?
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 border-t border-slate-100 px-4 sm:px-6 py-4">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="btn-outline w-full sm:w-auto rounded-xl px-4 py-2 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="w-full sm:w-auto rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}