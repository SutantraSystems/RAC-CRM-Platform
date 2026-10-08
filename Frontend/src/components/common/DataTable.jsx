import React from "react";
import { Edit2, Trash2, Plus, Eye } from "lucide-react";


export default function DataTable({
  title,
  itemLabel = "records",
  addLabel = "Add",
  columns = [],
  data = [],
  page = 1,
  total = 0,
  totalPages = 1,
  pageSize = 25,
  setPage,
  onAdd,
  onEdit,
  onDelete,
  onRowClick,
}) {
  const renderCell = (column, row) => {
    if (column.render) return column.render(row);

    const value = row[column.key];
    return value === null || value === undefined || value === "" ? "-" : value;
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-400 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-1.5 border-b border-slate-400 bg-slate-50/50">
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-800 text-base">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{total} total records</p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="btn-primary flex shrink-0 items-center gap-2 px-4 sm:px-5"
        >
          <Plus size={15} />
          {addLabel}
        </button>
      </div>

      {/* Table */}
      <div className="max-h-[60vh] sm:max-h-[400px] overflow-auto overscroll-x-contain bg-slate-50 p-1">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "separate", borderSpacing: "0 5px" }}
        >
          <thead className="sticky top-0 z-30">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-2 text-left text-sm font-extrabold text-slate-700 bg-white border-b border-slate-200 whitespace-nowrap sticky top-0 z-30"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-2 text-left text-sm font-extrabold text-slate-700 bg-white border-b border-slate-200 whitespace-nowrap sticky top-0 z-30">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-10 text-slate-400 bg-white rounded-xl"
                >
                  No {itemLabel} found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className="bg-white border-b border-slate-100 hover:bg-slate-200 transition-colors duration-150 cursor-pointer"
                >
                  {columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={`px-4 py-1.5 text-slate-700 whitespace-nowrap ${
                        index === 0 ? "rounded-l-xl text-slate-800" : ""
                      }`}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}

                  <td className="px-2 py-1.5 rounded-r-xl">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick?.(row);
                        }}
                        title="View Details"
                        className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(row);
                        }}
                        title="Edit"
                        className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(row);
                        }}
                        title="Delete"
                        className="p-2 rounded-lg bg-red-50 text-danger hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 sm:px-4 py-2 border-t border-slate-400 bg-slate-50/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
            <p className="text-sm text-slate-500 text-center md:text-left">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(page - 1) * pageSize + 1}
              </span>
              {" – "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * pageSize, total)}
              </span>
              {" of "}
              <span className="font-semibold text-slate-700">{total}</span> {itemLabel}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="btn-outline py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              <span className="btn-primary py-2 px-4 pointer-events-none">{page}</span>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="btn-outline py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
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