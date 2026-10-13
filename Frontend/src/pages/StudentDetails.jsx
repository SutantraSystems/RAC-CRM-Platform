import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  getStudentById,
  updateStudentStatus,
  updateStudent,
  deleteStudent,
} from "../services/studentApi";
import StudentForm from "../components/forms/StudentForm";
import FormModal from "../components/common/FormModal";
import { getStatusLabel } from "../data/students";
import OverviewTab from "../components/studentDetails/OverviewTab";
import DocumentsTab from "../components/studentDetails/DocumentsTab";
import CommentsTab from "../components/studentDetails/CommentsTab";
import RemindersTab from "../components/studentDetails/RemindersTab";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import RecordActions from "../components/common/RecordActions";
import useToast from "../hooks/useToast";

const TABS = ["Overview", "Documents", "Comments", "Reminders"];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // The list URL (with ?page=&filters...) this page was opened from: Students or Reminder History. Missing when opened directly, in which case plain /students.
  const fromList =
    typeof location.state?.from === "string" &&
    (location.state.from.startsWith("/students") ||
      location.state.from.startsWith("/reminder-history"))
      ? location.state.from
      : "/students";
  const listState = location.state?.dashboardFilters
    ? { dashboardFilters: location.state.dashboardFilters }
    : undefined;
  const backLabel = fromList.startsWith("/reminder-history")
    ? "Back to Reminder History"
    : "Back to Students";

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
  const { setToast, toastElement } = useToast();
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
      navigate(fromList, { state: listState });
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

  // Save the new status, rolling back if the server rejects it
  const handleStatusChange = async (newStatus) => {
    const previous = student.status || "not_sure";
    if (newStatus === previous) return;

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
        <button onClick={() => navigate(fromList, { state: listState })} className="btn-outline">
          {backLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {toastElement}

      <button
        onClick={() => navigate(fromList, { state: listState })}
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={15} />
        {backLabel}
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

          <RecordActions
            singular="Student"
            onEdit={() => setShowEdit(true)}
            onDelete={() => setShowDelete(true)}
          />
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
        <FormModal title="Edit Student" onClose={() => setShowEdit(false)}>
          <StudentForm
            initialData={student}
            onSubmit={handleSaveEdit}
            onCancel={() => setShowEdit(false)}
          />
        </FormModal>
      )}

      <ConfirmDeleteModal
        open={showDelete}
        title={"Delete Student?"}
        message={`Are you sure you want to delete ${student.full_name || "this student"}?`}
        confirmLabel={"Delete Student"}
        loading={deleting}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}