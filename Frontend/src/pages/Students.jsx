import React, { useState, useEffect } from "react";
import axios from "axios";

import StudentFilters from "../components/filters/StudentFilters";
import StudentsTable from "../components/tables/StudentsTable";
import StudentForm from "../components/forms/StudentForm";

import {
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentApi";

export default function Students() {
  const [students, setStudents] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // filters state
  const [filters, setFilters] = useState({});

  //  Fetch students (supports pagination + filters)
  const fetchStudents = async (pageNumber = 1, filtersData = {}) => {
    try {
      const params = new URLSearchParams();

      // pagination
      params.append("page", pageNumber);

      // filters
      if (filtersData.search) {
        params.append("search", filtersData.search);
      }

      if (filtersData.country) {
        params.append("country", filtersData.country);
      }

      if (filtersData.status) {
        params.append("status", filtersData.status);
      }

      if (filtersData.year) {
        params.append("year", filtersData.year);
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/students/?${params.toString()}`,
      );

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
    } catch (error) {
      console.error("Save failed:", error);

      console.log("Backend Response:", error.response?.data);

      alert(JSON.stringify(error.response?.data, null, 2));
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
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete student");
    }
  };

  return (
    <div className="space-y-0">
      <StudentFilters onFilter={handleFilter} onReset={handleReset} />

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
    </div>
  );
}
