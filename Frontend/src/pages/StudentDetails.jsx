import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getStudentById } from "../services/studentApi";
import Toast from "../components/ui/Toast";
import OverviewTab from "../components/studentDetails/OverviewTab";
import DocumentsTab from "../components/studentDetails/DocumentsTab";
import CommentsTab from "../components/studentDetails/CommentsTab";

const TABS = ["Overview", "Documents", "Comments"];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [toast, setToast] = useState(null);

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
    <div className="space-y-4">
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

      <div className="pt-2 pb-1">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl text-slate-800 tracking-tight">
              {student.full_name || "Unnamed Student"}
            </h1>

          </div>
        </div>
      </div>



      <div className="bg-white rounded-2xl shadow-card">
        <div className="flex border-b border-slate-100 px-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "Overview" && <OverviewTab student={student} />}
          {activeTab === "Documents" && (
            <DocumentsTab studentId={student.id} setToast={setToast} />
          )}
          {activeTab === "Comments" && (
            <CommentsTab studentId={student.id} setToast={setToast} />
          )}
        </div>
      </div>
    </div>
  );
}