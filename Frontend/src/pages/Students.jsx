import React, { useState, useEffect, useRef } from "react";
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
import { CheckCircle2, Trash2, ArrowLeft } from "lucide-react";
import useListQuery from "../hooks/useListQuery";
import useBulkSelection from "../hooks/useBulkSelection";
import { PAGE_SIZE, getErrorMessage } from "../config/crmConfig";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import useToast from "../hooks/useToast";

const FILTER_KEYS = ["search", "country", "intake", "year", "status", "source_file"];

export default function Students() {
  const navigate = useNavigate();
  const location = useLocation();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { setToast, toastElement } = useToast();

  // Page + applied filters live in the URL (shared hook, same as Payments / Universities).
  const { page, filters, reloadKey, setPage, writeParams, applyFilters, clearFilters } =
    useListQuery(FILTER_KEYS, ["year"]);

  // Single-student delete state
  const [studentToDelete, setStudentToDelete] =
    useState(null);
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

  const {
    selectedIds,
    selectedCount,
    allMatchingSelected,
    selectingAll: selectingAllMatching,
    showSelectAllMatching: showSelectAllMatchingBanner,
    showBulkConfirm: showBulkDeleteConfirm,
    setShowBulkConfirm: setShowBulkDeleteConfirm,
    bulkDeleting,
    toggleSelect: handleToggleSelect,
    toggleSelectAll: handleToggleSelectAll,
    selectAllMatching: handleSelectAllMatching,
    clearSelection: handleClearSelection,
    confirmBulkDelete: handleConfirmBulkDelete,
  } = useBulkSelection({
    rows: students,
    total,
    resetOn: [filters, reloadKey],
    fetchAllIds: async () => {
      const response = await getStudentIds(buildFilterOnlyParams(filters));
      return response.data.ids;
    },
    bulkRemove: deleteStudents,
    onSelectAllError: (error) => {
      console.error(
        "Failed to select all matching students:",
        error
      );

      setToast({
        type: "error",
        message:
          "Could not select all students. Please try again.",
      });
    },
    onDeleted: async (ids) => {
      const countResponse =
        await getStudents(
          buildParams(1, filters)
        );

      const { total_pages: newTotalPages } = countResponse.data;

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
    },
    onDeleteError: (error) => {
      console.error(
        "Bulk delete failed:",
        error
      );

      setToast({
        type: "error",
        message:
          "Failed to delete selected students. Please try again.",
      });
    },
  });

  // Fetch students
  const fetchStudents = async (
    pageNumber = 1,
    filtersData = {}
  ) => {
    const current = ++requestId.current;
    let retrying = false;

    setLoading(true);

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
        retrying = true; // the page-1 refetch keeps the loading state on
        writeParams(1, filtersData);
        return;
      }

      console.error(
        "Error loading students:",
        error
      );
    } finally {
      // Only the latest request ends the loading state.
      if (current === requestId.current && !retrying) setLoading(false);
    }
  };

  // Auto refetch when page or filters change
  useEffect(() => {
    fetchStudents(page, filters);
  }, [page, filters, reloadKey]);

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
      state: {
        from: `${location.pathname}${location.search}`,
        dashboardFilters: location.state?.dashboardFilters,
      },
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

  // Close delete confirmation
  const handleCloseDeleteConfirm = () => {
    if (bulkDeleting || deletingStudent) {
      return;
    }

    setShowBulkDeleteConfirm(false);
    setStudentToDelete(null);
  };

  const dashboardFilters = location.state?.dashboardFilters;

  const handleBackToDashboard = () =>
    navigate("/dashboard", { state: { dashboardFilters } });

  return (
    <div className="space-y-2">

      {/* Toast */}
      {toastElement}

      {dashboardFilters && (
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
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
        loading={loading}
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
      <ConfirmDeleteModal
        open={showBulkDeleteConfirm}
        title={studentToDelete ? "Delete Student?" : `Delete ${selectedCount} ${selectedCount === 1 ? "Student" : "Students"}?`}
        message={studentToDelete ? `Are you sure you want to delete ${studentToDelete.full_name}?` : "Are you sure you want to delete the selected students?"}
        confirmLabel={studentToDelete ? "Delete Student" : "Delete Students"}
        loading={bulkDeleting || deletingStudent}
        onCancel={handleCloseDeleteConfirm}
        onConfirm={studentToDelete ? handleConfirmDeleteStudent : handleConfirmBulkDelete}
      />
    </div>
  );
}