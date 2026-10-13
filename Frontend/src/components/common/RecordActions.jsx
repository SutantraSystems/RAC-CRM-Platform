import React from "react";
import { Edit2, Trash2 } from "lucide-react";

// Edit / Delete buttons shown in the tab bar of every details page.
export default function RecordActions({ singular = "Record", onEdit, onDelete }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        title={`Edit ${singular}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
      >
        <Edit2 size={14} />
        <span className="hidden sm:inline">Edit</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        title={`Delete ${singular}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-danger hover:bg-red-100 transition-colors"
      >
        <Trash2 size={14} />
        <span className="hidden sm:inline">Delete</span>
      </button>
    </div>
  );
}