import React from "react";

export default function FormModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-4xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center gap-2 px-4 sm:px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-20">
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 transition-colors duration-150 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pt-4 pb-0 sm:px-6 sm:pt-6">{children}</div>
      </div>
    </div>
  );
}