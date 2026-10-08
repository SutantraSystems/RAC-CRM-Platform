import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import FormModal from "../components/common/FormModal";
import Toast from "../components/ui/Toast";
import { CheckCircle2, Trash2 } from "lucide-react";
import useListQuery from "../hooks/useListQuery";
import { PAGE_SIZE, getErrorMessage } from "../config/crmConfig";

const FILTER_KEYS = ["search", "country", "intake", "year", "status", "source_file"];

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();

  const [students, setStudents] = useState([]);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);

  // Page + applied filters live in the URL (shared hook, same as Payments / Universities).
  const { page, filters, reloadKey, setPage, writeParams, applyFilters, clearFilters } =
    useListQuery(FILTER_KEYS, ["year"]);

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

  // Filters only (no pagination). "all" year means no year filter.
  const buildFilterOnlyParams = (filtersData) => {
    const params = {};
    ["search", "country", "intake", "status", "source_file"].forEach((key) => {
      if (filtersData[key]) params[key] = filtersData[key];
    });
    if (filtersData.year && filtersData.year !== "all") params.year = filtersData.year;
    return params;
  };

  // Filters + pagination for the student list.
  const buildParams = (pageNumber, filtersData) => ({
    page: pageNumber,
    page_size: PAGE_SIZE,
    ...buildFilterOnlyParams(filtersData),
  });

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
      setTotalPages(response.data.total_pages);
    } catch (error) {
      // The page in the URL no longer exists (edited URL, or the last row of the last page was deleted): fall back to page 1.
      if (error.response?.status === 404 && pageNumber > 1) {
        writeParams(1, filtersData);
        return;
      }

      console.error(
        "Error loading students:",
        error
      );
    }
  };

  // Auto refetch when page or filters change
  useEffect(() => {
    fetchStudents(page, filters);
  }, [page, filters, reloadKey]);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  }, [filters, reloadKey]);

  // Handle filter apply (a new filter set always starts on page 1)
  const handleFilter = (newFilters) => applyFilters(newFilters);

  // Handle reset filters
  const handleReset = () => clearFilters();

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

  // Navigate to Student Details `from` remembers this exact list URL (page + filters) so that "Back to Students" can return to it.
  const handleViewDetails = (id) => {
    navigate(`/students/${id}`, {
      state: { from: `${location.pathname}${location.search}` },
    });
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
          "Failed to save student. Please check the form and try again.",
          true
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
        appliedFilters={filters}
      />

      {/* Bulk Selection Toolbar */}
      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-primary-50 border border-primary-100 rounded-2xl px-3 sm:px-4 py-3 mb-3">

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">

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
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-danger bg-red-50 hover:bg-red-100 transition-colors"
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
        pageSize={PAGE_SIZE}
        setPage={setPage}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={
          handleDeleteStudent
        }
        onViewDetails={
          handleViewDetails
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
        <FormModal
          title={selectedStudent ? "Edit Student" : "Add Student"}
          onClose={() => setShowForm(false)}
        >
          <StudentForm
            initialData={selectedStudent || {}}
            onSubmit={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </FormModal>
      )}

      {/* Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-4">

          <div
            className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 sm:px-6 py-4">

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
            <div className="px-4 sm:px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Trash2
                    size={18}
                    className="text-danger"
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-medium text-slate-700 break-words">
                    {studentToDelete
                      ? `Are you sure you want to delete ${studentToDelete.full_name}?`
                      : "Are you sure you want to delete the selected students?"}
                  </p>

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 border-t border-slate-100 px-4 sm:px-6 py-4">

              <button
                onClick={
                  handleCloseDeleteConfirm
                }
                disabled={
                  bulkDeleting ||
                  deletingStudent
                }
                className="btn-outline w-full sm:w-auto rounded-xl px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
                className="w-full sm:w-auto rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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