import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  deleteStudents,
  getStudentIds,
} from "../services/studentApi";
import StudentFilters from "../components/filters/StudentFilters";
import StudentsTable from "../components/tables/StudentsTable";
import StudentForm from "../components/forms/StudentForm";
import Toast from "../components/ui/Toast";
import { CheckCircle2, Trash2 } from "lucide-react";

const getErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
    if (typeof value === "string") {
      return firstKey === "non_field_errors" ? value : `${firstKey}: ${value}`;
    }
  }

  return fallback;
};

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);

  // filters state
  const [filters, setFilters] = useState({});

  // bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const [selectingAllMatching, setSelectingAllMatching] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const buildParams = (pageNumber, filtersData) => {
    const params = { page: pageNumber };

    if (filtersData.search) params.search = filtersData.search;
    if (filtersData.country) params.country = filtersData.country;
    if (filtersData.status) params.status = filtersData.status;
    if (filtersData.year) params.year = filtersData.year;

    return params;
  };

  const buildFilterOnlyParams = (filtersData) => {
    const params = {};

    if (filtersData.search) params.search = filtersData.search;
    if (filtersData.country) params.country = filtersData.country;
    if (filtersData.status) params.status = filtersData.status;
    if (filtersData.year) params.year = filtersData.year;

    return params;
  };

  const fetchStudents = async (pageNumber = 1, filtersData = {}) => {
    try {
      const params = buildParams(pageNumber, filtersData);
      const response = await getStudents(params);

      console.log("API Response:", response.data);

      setStudents(response.data.data);
      setTotal(response.data.total);
      setPage(response.data.page);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  //  Auto refetch when page OR filters change
  useEffect(() => {
    fetchStudents(page, filters);
  }, [page, filters]);

  useEffect(() => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  }, [filters]);

  // Handle filter apply
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  //  Handle reset filters
  const handleReset = () => {
    setFilters({});
    setPage(1);
  };

  //  Add student modal open
  const handleAdd = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  //  Edit student modal open
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  // Navigate to the Student Details page
  const handleViewDetails = (id) => {
    navigate(`/students/${id}`);
  };

  //  Save student (create/update)
  const handleSave = async (formData) => {
    try {
      console.log("Submitting:", formData);

      if (selectedStudent) {
        await updateStudent(selectedStudent.id, formData);
      } else {
        await createStudent(formData);
      }

      setShowForm(false);

      await fetchStudents(page, filters);

      setToast({
        type: "success",
        message: selectedStudent
          ? "Student updated successfully!"
          : "Student added successfully!",
      });
    } catch (error) {
      console.error("Save failed:", error);

      console.log("Backend Response:", error.response?.data);

      setToast({
        type: "error",
        message: getErrorMessage(
          error.response?.data,
          "Failed to save student. Please check the form and try again."
        ),
      });
    }
  };

  //  Delete student
  const handleDeleteStudent = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmDelete) return;

    try {
      await deleteStudent(id);
      fetchStudents(page, filters);

      setToast({
        type: "success",
        message: "Student deleted successfully.",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      setToast({
        type: "error",
        message: "Failed to delete student.",
      });
    }
  };

  // Toggle a single row's selection
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setAllMatchingSelected(false);
  };

  // Select/deselect every student on the current page
  const handleToggleSelectAll = (checked) => {
    const pageIds = students.map((s) => s.id);

    if (!checked) {
      if (allMatchingSelected) {
        setSelectedIds(new Set());
        setAllMatchingSelected(false);
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          pageIds.forEach((id) => next.delete(id));
          return next;
        });
      }
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSelectAllMatching = async () => {
    try {
      setSelectingAllMatching(true);
      const response = await getStudentIds(buildFilterOnlyParams(filters));
      setSelectedIds(new Set(response.data.ids));
      setAllMatchingSelected(true);
    } catch (error) {
      console.error("Failed to select all matching students:", error);
      setToast({
        type: "error",
        message: "Could not select all students. Please try again.",
      });
    } finally {
      setSelectingAllMatching(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  };

  // Bulk delete confirmed — send only the selected ids
  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);

    try {
      setBulkDeleting(true);
      await deleteStudents(ids);

      setShowBulkDeleteConfirm(false);
      setSelectedIds(new Set());
      setAllMatchingSelected(false);

      const countResponse = await getStudents(buildParams(1, filters));
      const { total: newTotal, total_pages: newTotalPages } = countResponse.data;

      const targetPage = Math.min(page, Math.max(newTotalPages, 1));

      let refreshed = countResponse.data;
      if (targetPage !== 1) {
        const pageResponse = await getStudents(buildParams(targetPage, filters));
        refreshed = pageResponse.data;
      }

      setStudents(refreshed.data);
      setTotal(refreshed.total);
      setPage(refreshed.page);
      setTotalPages(refreshed.total_pages);

      setToast({
        type: "success",
        message: `${ids.length} ${ids.length === 1 ? "student" : "students"} deleted successfully.`,
      });
    } catch (error) {
      console.error("Bulk delete failed:", error);
      setToast({
        type: "error",
        message: "Failed to delete selected students. Please try again.",
      });
      // Keep selection and modal open on failure so the user can retry.
    } finally {
      setBulkDeleting(false);
    }
  };

  const selectedCount = selectedIds.size;
  const pageIds = students.map((s) => s.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const showSelectAllMatchingBanner =
    allOnPageSelected && !allMatchingSelected && total > pageIds.length;

  return (
    <div className="space-y-2">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <StudentFilters onFilter={handleFilter} onReset={handleReset} />

      {/* Bulk selection toolbar — only shown once something is selected */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary-700 font-medium text-sm">
              <CheckCircle2 size={16} />
              {allMatchingSelected
                ? `All ${selectedCount} Students Selected`
                : `${selectedCount} ${selectedCount === 1 ? "Student" : "Students"} Selected`}
            </div>

            {showSelectAllMatchingBanner && (
              <button
                onClick={handleSelectAllMatching}
                disabled={selectingAllMatching}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {selectingAllMatching ? "Selecting..." : `Select all ${total}`}
              </button>
            )}

            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Clear selection
            </button>
          </div>

          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-danger bg-red-50 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={15} />
            Delete Selected
          </button>
        </div>
      )}

      {/* Students Table */}
      <StudentsTable
        data={students}
        page={page}
        total={total}
        totalPages={totalPages}
        setPage={setPage}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteStudent}
        onViewDetails={handleViewDetails}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
      />

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2
                className="text-base font-semibold text-slate-800"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {selectedStudent ? "Edit Student" : "Add Student"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <StudentForm
                initialData={selectedStudent || {}}
                onSubmit={handleSave}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3
                className="text-base font-semibold text-slate-800"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Delete {selectedCount}{" "}
                {selectedCount === 1 ? "Student" : "Students"}?
              </h3>

              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkDeleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Trash2 size={18} className="text-danger" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Are you sure you want to delete the selected students?
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={bulkDeleting}
                className="btn-outline rounded-xl px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmBulkDelete}
                disabled={bulkDeleting}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkDeleting ? "Deleting..." : "Delete Students"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}