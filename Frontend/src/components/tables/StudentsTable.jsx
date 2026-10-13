import React from "react";
import DataTable from "../common/DataTable";
import { getStatusLabel } from "../../data/students";
import { STUDENT_STATUS_TONES } from "../../config/crmConfig";
import StatusBadge from "../ui/StatusBadge";

const COLUMNS = [
  { key: "full_name", label: "Full Name", cellClassName: "px-2 py-1.5 text-slate-800", render: (student) => student.full_name },
  { key: "mobile_number", label: "Mobile", cellClassName: "px-2 py-1.5 text-slate-600", render: (student) => student.mobile_number },
  { key: "alternate_mobile_number", label: "Alternate Mobile", cellClassName: "px-2 py-1.5 text-slate-600" },
  { key: "email", label: "Email", cellClassName: "px-2 py-1.5 text-slate-600", render: (student) => student.email },
  {
    key: "status",
    label: "Status",
    cellClassName: "px-2 py-1.5",
    render: (student) => {
      const currentStatus = student.status || "not_sure";
      return (
        <StatusBadge
          label={getStatusLabel(currentStatus)}
          tone={STUDENT_STATUS_TONES[currentStatus]}
        />
      );
    },
  },
  { key: "source_file", label: "Source File", cellClassName: "px-2 py-1.5 text-slate-600" },
];

export default function StudentsTable({
  data,
  loading = false,
  page,
  total,
  totalPages,
  pageSize = 25,
  setPage,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  return (
    <DataTable
      title="Students"
      itemLabel="students"
      addLabel="Add Student"
      emptyLabel="No Students Found"
      columns={COLUMNS}
      data={data}
      loading={loading}
      page={page}
      total={total}
      totalPages={totalPages}
      pageSize={pageSize}
      setPage={setPage}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={(student) => onDelete(student.id)}
      onRowClick={(student) => onViewDetails(student.id)}
      getRowLabel={(student) => student.full_name}
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
    />
  );
}