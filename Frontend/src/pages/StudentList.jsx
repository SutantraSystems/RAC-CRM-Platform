import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
    age: ""
  });

  const [editId, setEditId] = useState(null);

  // =========================
  // FETCH STUDENTS (READ)
  // =========================
  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/students/"
      );
      setStudents(res.data);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // CREATE STUDENT
  // =========================
  const createStudent = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/students/",
        form
      );

      setForm({ name: "", email: "", course: "", age: "" });
      fetchStudents();
    } catch (err) {
      console.log("Create error:", err);
    }
  };

  // =========================
  // DELETE STUDENT
  // =========================
  const deleteStudent = async (id) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/students/${id}/`
      );
      fetchStudents();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // =========================
  // EDIT (FILL FORM)
  // =========================
  const handleEdit = (student) => {
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age
    });
    setEditId(student.id);
  };

  // =========================
  // UPDATE STUDENT
  // =========================
  const updateStudent = async () => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/students/${editId}/`,
        form
      );

      setEditId(null);
      setForm({ name: "", email: "", course: "", age: "" });
      fetchStudents();
    } catch (err) {
      console.log("Update error:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">

      {/* ================= FORM ================= */}
      <div className="mb-6 space-y-2">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="border p-2 w-full"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full"
        />

        <input
          name="course"
          value={form.course}
          onChange={handleChange}
          placeholder="Course"
          className="border p-2 w-full"
        />

        <input
          name="age"
          value={form.age}
          onChange={handleChange}
          placeholder="Age"
          className="border p-2 w-full"
        />

        {editId ? (
          <button
            onClick={updateStudent}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Update Student
          </button>
        ) : (
          <button
            onClick={createStudent}
            className="bg-green-500 text-white px-4 py-2"
          >
            Add Student
          </button>
        )}
      </div>

      {/* ================= TABLE ================= */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">

                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.course}</td>
                <td>{s.age}</td>

                <td className="space-x-2">
                  <button
                    onClick={() => handleEdit(s)}
                    className="text-blue-500"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteStudent(s.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}