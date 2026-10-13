import React from "react";
import { Trash2 } from "lucide-react";

export default function ConfirmDeleteModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-3 sm:p-4"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-white shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 sm:px-6 py-4">
          <h3
            className="font-display text-lg font-bold text-slate-900"
          >
            {title}
          </h3>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="px-4 sm:px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
              <Trash2 size={18} className="text-danger" />
            </div>
            <p className="min-w-0 text-sm font-medium text-slate-700 break-words">{message}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 border-t border-slate-200 px-4 sm:px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-danger px-6 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition-all duration-150 hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}