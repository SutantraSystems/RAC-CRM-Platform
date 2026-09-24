import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudents,
  createStudent,
  updateStudent,
  updateStudentStatus,
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

  if (typeof data.detail === "string") {
    return data.detail;
  }

  const firstKey = Object.keys(data)[0];

  if (firstKey) {
    const value = Array.isArray(data[firstKey])
      ? data[firstKey][0]
      : data[firstKey];

    if (typeof value === "string") {
      return firstKey === "non_field_errors"
        ? value
        : `${firstKey}: ${value}`;
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

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    intake: "",
    year: "",
    status: "",
  });

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [allMatchingSelected, setAllMatchingSelected] =
    useState(false);
  const [selectingAllMatching, setSelectingAllMatching] =
    useState(false);

  // Delete confirmation state
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] =
    useState(false);
  const [studentToDelete, setStudentToDelete] =
    useState(null);
  const [bulkDeleting, setBulkDeleting] =
    useState(false);
  const [deletingStudent, setDeletingStudent] =
    useState(false);

  // Build parameters for student list
  const buildParams = (pageNumber, filtersData) => {
    const params = {
      page: pageNumber,
    };

    if (filtersData.search) {
      params.search = filtersData.search;
    }

    if (filtersData.country) {
      params.country = filtersData.country;
    }

    if (filtersData.intake) {
      params.intake = filtersData.intake;
    }

    if (filtersData.status) {
      params.status = filtersData.status;
    }


    if (filtersData.year && filtersData.year !== "all") {
      params.year = filtersData.year;
    }

    return params;
  };

  // Build parameters without pagination
  const buildFilterOnlyParams = (filtersData) => {
    const params = {};

    if (filtersData.search) {
      params.search = filtersData.search;
    }

    if (filtersData.country) {
      params.country = filtersData.country;
    }

    if (filtersData.intake) {
      params.intake = filtersData.intake;
    }

    if (filtersData.status) {
      params.status = filtersData.status;
    }

    if (filtersData.year && filtersData.year !== "all") {
      params.year = filtersData.year;
    }

    return params;
  };

  // Fetch students
  const fetchStudents = async (
    pageNumber = 1,
    filtersData = {}
  ) => {
    try {
      const params = buildParams(
        pageNumber,
        filtersData
      );

      const response = await getStudents(params);

      setStudents(response.data.data);
      setTotal(response.data.total);
      setPage(response.data.page);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error(
        "Error loading students:",
        error
      );
    }
  };

  // Auto refetch when page or filters change
  useEffect(() => {
    fetchStudents(page, filters);
  }, [page, filters]);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  }, [filters]);

  // Handle filter apply
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handle reset filters
  const handleReset = () => {
    setFilters({
      search: "",
      country: "",
      intake: "",
      year: "",
      status: "",
    });

    setPage(1);
  };

  // Add student modal
  const handleAdd = () => {
    setSelectedStudent(null);
    setShowForm(true);
  };

  // Edit student modal
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  // Navigate to Student Details
  const handleViewDetails = (id) => {
    navigate(`/students/${id}`);
  };

  // Update student status
  const handleStatusChange = async (id, newStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, status: newStatus }
          : student
      )
    );

    try {
      await updateStudentStatus(id, newStatus);

      const statusLabel =
        newStatus === "active"
          ? "Active"
          : newStatus === "inactive"
            ? "Inactive"
            : "Not Sure";

      setToast({
        type: "success",
        message: `Status updated to ${statusLabel} successfully.`,
      });
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      setToast({
        type: "error",
        message:
          "Failed to update status. Please try again.",
      });

      fetchStudents(page, filters);
    }
  };

  // Save student
  const handleSave = async (formData) => {
    try {
      if (selectedStudent) {
        await updateStudent(
          selectedStudent.id,
          formData
        );
      } else {
        await createStudent(formData);
      }

      setShowForm(false);

      await fetchStudents(
        page,
        filters
      );

      setToast({
        type: "success",
        message: selectedStudent
          ? "Student updated successfully!"
          : "Student added successfully!",
      });
    } catch (error) {
      console.error(
        "Save failed:",
        error
      );

      const data = error.response?.data;

      setToast({
        type: "error",
        message: getErrorMessage(
          data,
          "Failed to save student. Please check the form and try again."
        ),
      });

      // Hand duplicate email / mobile errors back to the form (shown inline).
      const fieldErrors = {};
      ["email", "mobile_number"].forEach((key) => {
        if (data?.[key]) {
          fieldErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
        }
      });
      return fieldErrors;
    }
  };

  // Open single student delete confirmation

  const handleDeleteStudent = (studentId) => {
    const student = students.find(
      (student) => student.id === studentId
    );

    if (!student) return;

    setStudentToDelete(student);
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete?.id) return;

    try {
      setDeletingStudent(true);

      await deleteStudent(studentToDelete.id);

      setShowBulkDeleteConfirm(false);
      setStudentToDelete(null);

      await fetchStudents(page, filters);

      setToast({
        type: "success",
        message: "Student deleted successfully.",
      });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingStudent(false);
    }
  };

  // Toggle a single row selection
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

  // Select/deselect all students on current page
  const handleToggleSelectAll = (
    checked
  ) => {
    const pageIds = students.map(
      (student) => student.id
    );

    if (!checked) {
      if (allMatchingSelected) {
        setSelectedIds(new Set());
        setAllMatchingSelected(false);
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev);

          pageIds.forEach((id) => {
            next.delete(id);
          });

          return next;
        });
      }

      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);

      pageIds.forEach((id) => {
        next.add(id);
      });

      return next;
    });
  };

  // Select all matching students
  const handleSelectAllMatching =
    async () => {
      try {
        setSelectingAllMatching(true);

        const response =
          await getStudentIds(
            buildFilterOnlyParams(filters)
          );

        setSelectedIds(
          new Set(response.data.ids)
        );

        setAllMatchingSelected(true);
      } catch (error) {
        console.error(
          "Failed to select all matching students:",
          error
        );

        setToast({
          type: "error",
          message:
            "Could not select all students. Please try again.",
        });
      } finally {
        setSelectingAllMatching(false);
      }
    };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  };

  // Bulk delete
  const handleConfirmBulkDelete =
    async () => {
      const ids =
        Array.from(selectedIds);

      try {
        setBulkDeleting(true);

        await deleteStudents(ids);

        setShowBulkDeleteConfirm(
          false
        );

        setSelectedIds(new Set());
        setAllMatchingSelected(false);

        const countResponse =
          await getStudents(
            buildParams(1, filters)
          );

        const {
          total: newTotal,
          total_pages: newTotalPages,
        } = countResponse.data;

        const targetPage = Math.min(
          page,
          Math.max(newTotalPages, 1)
        );

        let refreshed =
          countResponse.data;

        if (targetPage !== 1) {
          const pageResponse =
            await getStudents(
              buildParams(
                targetPage,
                filters
              )
            );

          refreshed =
            pageResponse.data;
        }

        setStudents(
          refreshed.data
        );

        setTotal(
          refreshed.total
        );

        setPage(
          refreshed.page
        );

        setTotalPages(
          refreshed.total_pages
        );

        setToast({
          type: "success",
          message: `${ids.length} ${ids.length === 1
            ? "student"
            : "students"
            } deleted successfully.`,
        });
      } catch (error) {
        console.error(
          "Bulk delete failed:",
          error
        );

        setToast({
          type: "error",
          message:
            "Failed to delete selected students. Please try again.",
        });

        // Keep selection and modal open
      } finally {
        setBulkDeleting(false);
      }
    };

  // Close delete confirmation
  const handleCloseDeleteConfirm = () => {
    if (bulkDeleting || deletingStudent) {
      return;
    }

    setShowBulkDeleteConfirm(false);
    setStudentToDelete(null);
  };

  const selectedCount =
    selectedIds.size;

  const pageIds = students.map(
    (student) => student.id
  );

  const allOnPageSelected =
    pageIds.length > 0 &&
    pageIds.every((id) =>
      selectedIds.has(id)
    );

  const showSelectAllMatchingBanner =
    allOnPageSelected &&
    !allMatchingSelected &&
    total > pageIds.length;

  return (
    <div className="space-y-2">

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      {/* Filters */}
      <StudentFilters
        onFilter={handleFilter}
        onClear={handleReset}
      />

      {/* Bulk Selection Toolbar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3 mb-3">

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 text-primary-700 font-medium text-sm">
              <CheckCircle2 size={16} />

              {allMatchingSelected
                ? `All ${selectedCount} Students Selected`
                : `${selectedCount} ${selectedCount === 1
                  ? "Student"
                  : "Students"
                } Selected`}
            </div>

            {showSelectAllMatchingBanner && (
              <button
                onClick={
                  handleSelectAllMatching
                }
                disabled={
                  selectingAllMatching
                }
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {selectingAllMatching
                  ? "Selecting..."
                  : `Select all ${total}`}
              </button>
            )}

            <button
              onClick={
                handleClearSelection
              }
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Clear selection
            </button>
          </div>

          <button
            onClick={() =>
              setShowBulkDeleteConfirm(
                true
              )
            }
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
        onDelete={
          handleDeleteStudent
        }
        onViewDetails={
          handleViewDetails
        }
        onStatusChange={
          handleStatusChange
        }
        selectedIds={selectedIds}
        onToggleSelect={
          handleToggleSelect
        }
        onToggleSelectAll={
          handleToggleSelectAll
        }
      />

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">

              <h2
                className="text-base font-semibold text-slate-800"
                style={{
                  fontFamily:
                    "'Sora', sans-serif",
                }}
              >
                {selectedStudent
                  ? "Edit Student"
                  : "Add Student"}
              </h2>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">

              <StudentForm
                initialData={
                  selectedStudent || {}
                }
                onSubmit={handleSave}
                onCancel={() =>
                  setShowForm(false)
                }
              />

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">

              <h3
                className="text-base font-semibold text-slate-800"
                style={{
                  fontFamily:
                    "'Sora', sans-serif",
                }}
              >
                {studentToDelete
                  ? "Delete Student?"
                  : `Delete ${selectedCount} ${selectedCount === 1
                    ? "Student"
                    : "Students"
                  }?`}
              </h3>

              <button
                onClick={
                  handleCloseDeleteConfirm
                }
                disabled={
                  bulkDeleting ||
                  deletingStudent
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Trash2
                    size={18}
                    className="text-danger"
                  />
                </div>

                <div>

                  <p className="text-sm font-medium text-slate-700">
                    {studentToDelete
                      ? `Are you sure you want to delete ${studentToDelete.full_name}?`
                      : "Are you sure you want to delete the selected students?"}
                  </p>

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

              <button
                onClick={
                  handleCloseDeleteConfirm
                }
                disabled={
                  bulkDeleting ||
                  deletingStudent
                }
                className="btn-outline rounded-xl px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  studentToDelete
                    ? handleConfirmDeleteStudent
                    : handleConfirmBulkDelete
                }
                disabled={
                  bulkDeleting ||
                  deletingStudent
                }
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {studentToDelete
                  ? deletingStudent
                    ? "Deleting..."
                    : "Delete Student"
                  : bulkDeleting
                    ? "Deleting..."
                    : "Delete Students"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}