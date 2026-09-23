import React, { useRef, useEffect } from "react";
import { Edit2, Trash2, Plus, Eye } from "lucide-react";

export default function StudentsTable({
  data,
  page,
  total,
  totalPages,
  setPage,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  const headerCheckboxRef = useRef(null);

  const pageIds = data.map((s) => s.id);

  const selectedOnPageCount = pageIds.filter((id) =>
    selectedIds.has(id)
  ).length;

  const allOnPageSelected =
    pageIds.length > 0 &&
    selectedOnPageCount === pageIds.length;

  const someOnPageSelected =
    selectedOnPageCount > 0 && !allOnPageSelected;

  // Header checkbox indeterminate state
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        someOnPageSelected;
    }
  }, [someOnPageSelected]);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-400 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-400 bg-slate-50/50">
        <div>
          <h2 className="font-semibold text-slate-800 text-base">
            Students
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            {total} total records
          </p>
        </div>

        <button
          onClick={onAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={15} />
          Add Student
        </button>
      </div>

      {/* Table */}
      <div className="max-h-[400px] overflow-auto bg-slate-50 p-1">
        <table
          className="w-full text-sm"
          style={{
            borderCollapse: "separate",
            borderSpacing: "0 5px",
          }}
        >
          {/* Table Header */}
          <thead className="sticky top-0 z-30">
            <tr>
              {/* Select All */}
              <th
                className="
                  px-4
                  py-2
                  w-10
                  text-left
                  bg-white
                  border-b
                  border-slate-200
                  sticky
                  top-0
                  z-30
                "
              >
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={(e) =>
                    onToggleSelectAll(e.target.checked)
                  }
                  className="
                    w-4
                    h-4
                    rounded
                    border-slate-300
                    text-primary-600
                    focus:ring-primary-500
                    cursor-pointer
                  "
                />
              </th>

              {[
                "Full Name",
                "Mobile",
                "Email",
                "Status",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="
                    px-4
                    py-2
                    text-left
                    text-sm
                    font-extrabold
                    text-slate-700
                    bg-white
                    border-b
                    border-slate-200
                    whitespace-nowrap
                    sticky
                    top-0
                    z-30
                  "
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="16"
                  className="
                    text-center
                    py-10
                    text-slate-400
                    bg-white
                    rounded-xl
                  "
                >
                  No Students Found
                </td>
              </tr>
            ) : (
              data.map((student) => {
                const currentStatus =
                  student.status || "not_sure";

                return (
                  <tr
                    key={student.id}
                    onClick={() =>
                      onViewDetails(student.id)
                    }
                    className="
                      bg-white
                      border-b
                      border-slate-100
                      hover:bg-slate-200
                      transition-colors
                      duration-150
                      cursor-pointer
                    "
                  >
                    {/* Checkbox */}
                    <td
                      className="px-4 py-1.5 rounded-l-xl"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(
                          student.id
                        )}
                        onChange={() =>
                          onToggleSelect(student.id)
                        }
                        className="
                          w-4
                          h-4
                          rounded
                          border-slate-300
                          text-primary-600
                          focus:ring-primary-500
                          cursor-pointer
                        "
                      />
                    </td>

                    {/* Full Name */}
                    <td className="px-2 py-1.5 text-slate-800 whitespace-nowrap">
                      {student.full_name}
                    </td>

                    {/* Mobile */}
                    <td className="px-2 py-1.5 text-slate-600 whitespace-nowrap">
                      {student.mobile_number}
                    </td>

                    {/* Email */}
                    <td className="px-2 py-1.5 text-slate-600 whitespace-nowrap">
                      {student.email}
                    </td>

                    {/* Status */}
                    <td
                      className="px-2 py-1.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          onStatusChange(student.id, e.target.value)
                        }
                        className="
                          border
                          border-slate-200
                          rounded-xl
                          px-3
                          py-1.5
                          text-sm
                          text-slate-700
                          bg-white
                          transition-all
                          hover:border-slate-300
                          focus:outline-none
                          focus:ring-2
                          focus:ring-primary-200
                          focus:border-primary-400
                          cursor-pointer
                        "
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="not_sure">Not Sure</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td
                      className="px-2 py-1.5 rounded-r-xl"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <div className="flex items-center gap-2">
                        {/* View */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(student.id);
                          }}
                          title="View Details"
                          className="
                            p-2
                            rounded-lg
                            bg-slate-50
                            text-slate-600
                            hover:bg-slate-100
                            transition-colors
                          "
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(student);
                          }}
                          title="Edit"
                          className="
                            p-2
                            rounded-lg
                            bg-primary-50
                            text-primary-600
                            hover:bg-primary-100
                            transition-colors
                          "
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(student.id);
                          }}
                          title="Delete"
                          className="
                            p-2
                            rounded-lg
                            bg-red-50
                            text-danger
                            hover:bg-red-100
                            transition-colors
                          "
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-2 border-t border-slate-400 bg-slate-50/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * 10 + 1}
              </span>
              {" – "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * 10, total)}
              </span>
              {" of "}
              <span className="font-semibold text-slate-700">
                {total}
              </span>{" "}
              students
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={page === 1}
                className="
                  btn-outline
                  py-2
                  px-4
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Prev
              </button>

              <span className="btn-primary py-2 px-4 pointer-events-none">
                {page}
              </span>

              <button
                onClick={() =>
                  setPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                disabled={page === totalPages}
                className="
                  btn-outline
                  py-2
                  px-4
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}