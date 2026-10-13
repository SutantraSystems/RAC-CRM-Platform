import React from "react";

// size="sm" is for short forms (e.g. reminders); same header, scrolling and footer as the big ones.
export default function FormModal({ title, onClose, children, size = "lg" }) {
  const sizeClass =
    size === "sm"
      ? "max-w-xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]"
      : "max-w-4xl h-[calc(100dvh-1rem)] sm:h-[90vh]";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex justify-center items-center z-50 p-2 sm:p-4">
      <div className={`bg-white rounded-2xl shadow-card-hover flex w-full flex-col overflow-hidden ${sizeClass}`}>
        <div className="flex justify-between items-center gap-2 px-4 sm:px-6 py-4 shrink-0 border-b border-slate-200 bg-white rounded-t-2xl">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-0 sm:px-6 sm:pt-6 [&>form]:flex [&>form]:min-h-full [&>form]:flex-col [&>form>:nth-last-child(2)]:mb-6">{children}</div>
      </div>
    </div>
  );
}