import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getStudentById, updateStudentStatus } from "../services/studentApi";
import { getStatusLabel } from "../data/students";
import Toast from "../components/ui/Toast";
import OverviewTab from "../components/studentDetails/OverviewTab";
import DocumentsTab from "../components/studentDetails/DocumentsTab";
import CommentsTab from "../components/studentDetails/CommentsTab";
import RemindersTab from "../components/studentDetails/RemindersTab";

const TABS = ["Overview", "Documents", "Comments", "Reminders"];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get("tab") || "").toLowerCase();
  const activeTab = TABS.find((t) => t.toLowerCase() === tabParam) || "Overview";
  const setActiveTab = (tab) =>
    setSearchParams(tab === "Overview" ? {} : { tab }, { replace: true });
  const [toast, setToast] = useState(null);

  const handleStatusChange = async (newStatus) => {
    const previous = student.status;
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
        <button onClick={() => navigate("/students")} className="btn-outline">
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
        onClick={() => navigate("/students")}
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
        <div className="flex overflow-x-auto overscroll-x-contain border-b border-slate-100 px-2 sm:px-4">
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
    </div>
  );
}