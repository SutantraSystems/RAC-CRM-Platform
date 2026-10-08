import React from "react";
import { Check, ChevronDown, AlertCircle } from "lucide-react";

export const LABEL_CLASS = "mb-2 block text-sm font-semibold text-slate-800";

export const isFilled = (value) =>
  value !== "" && value !== null && value !== undefined;

export default function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  className = "",
  children,
}) {
  return (
    <div className={`flex min-w-0 flex-col ${className}`}>
      <label htmlFor={htmlFor} className="mb-2 text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
          className="mt-2 text-[13px] font-medium text-red-600"
        >
          {String(error)}
        </p>
      ) : hint ? (
        <p className="mt-2 text-[13px] leading-snug text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const TextInput = ({ icon, error, className = "", ...props }) => (
  <div className="relative">
    {icon && (
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
        {icon}
      </span>
    )}
    <input
      {...props}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${props.id}-error` : undefined}
      className={`form-control [&::-webkit-inner-spin-button]:appearance-none ${
        icon ? "pl-11" : ""
      } ${error ? "border-red-400 hover:border-red-500 focus:border-red-500 focus:ring-red-100" : ""} ${className}`}
    />
  </div>
);

// Radio buttons drawn as pills. Good for 2 to 4 short choices (Intake, Payment, Status).
export const OptionPills = ({ name, labelId, value, options, onChange }) => (
  <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-3">
    {options.map((option) => {
      const checked = value === option.value;
      return (
        <label
          key={option.value}
          className={`flex min-h-[2.75rem] min-w-[7.5rem] flex-1 basis-[calc(50%-0.375rem)] cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-150 focus-within:ring-4 focus-within:ring-primary-100 sm:basis-0 ${
            checked
              ? "border-primary-500 bg-primary-50 font-semibold text-primary-700 ring-1 ring-primary-500/30"
              : "border-slate-300 bg-white text-slate-700 hover:border-primary-400 hover:bg-primary-50/50"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={checked}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              checked ? "border-primary-600" : "border-slate-400"
            }`}
          >
            {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
          </span>
          {option.label}
        </label>
      );
    })}
  </div>
);

export const FormSection = ({
  id,
  title,
  index,
  open = true,
  onToggle,
  filled = 0,
  total = 0,
  hasError = false,
  children,
}) => {
  const collapsible = Boolean(onToggle);
  const complete = total > 0 && filled === total;

  const badge =
    index === undefined ? null : (
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
          hasError
            ? "border-red-300 bg-red-50 text-red-500"
            : complete
            ? "border-primary-600 bg-primary-600 text-white"
            : "border-primary-300 bg-primary-50 text-primary-700"
        }`}
      >
        {hasError ? <AlertCircle size={16} /> : complete ? <Check size={16} strokeWidth={3} /> : index + 1}
      </span>
    );

  const headerContent = (
    <>
      {badge}
      <span className="flex-1 font-display text-base sm:text-lg font-bold text-primary-800">{title}</span>
      {collapsible && (
        <>
          <span className={`hidden text-[13px] font-medium sm:inline ${hasError ? "text-red-600" : "text-slate-500"}`}>
            {hasError ? "Needs attention" : `${filled} of ${total} added`}
          </span>
          <ChevronDown
            size={20}
            className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </>
      )}
    </>
  );

  return (
    <section
      className={`rounded-2xl border bg-white transition-shadow ${
        open ? "border-primary-200 shadow-card" : "border-slate-200 hover:border-primary-200"
      }`}
    >
      <h3>
        {collapsible ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={`form-section-${id}`}
            className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            {headerContent}
          </button>
        ) : (
          <div className="flex w-full items-center gap-3 px-5 py-4">{headerContent}</div>
        )}
      </h3>

      <div
        id={`form-section-${id}`}
        className={`${open ? "grid" : "hidden"} grid-cols-1 gap-x-5 gap-y-5 border-t border-slate-100 px-5 pb-6 pt-5 sm:grid-cols-2`}
      >
        {children}
      </div>
    </section>
  );
};

export const FormProgress = ({ sections, onSelect }) => {
  if (sections.length < 2) return null;

  return (
    <div className="flex gap-2" role="group" aria-label="Form progress">
      {sections.map((section) => {
        const percent = section.total ? Math.round((section.filled / section.total) * 100) : 0;
        const text = `${section.title}: ${section.filled} of ${section.total} added`;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            aria-label={text}
            title={text}
            className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
          >
            <span
              className="block h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </button>
        );
      })}
    </div>
  );
};

// Cancel + Save. Stays visible at the bottom of the modal while the form scrolls.
export const FormFooter = ({ onCancel, saving, submitLabel }) => (
  <div className="sticky bottom-0 z-10 -mx-4 !mt-auto flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
    <button
      type="button"
      onClick={onCancel}
      className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 active:scale-[0.98] sm:w-auto sm:min-w-[7.5rem]"
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={saving}
      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 px-7 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all duration-150 hover:bg-primary-700 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto sm:min-w-[9rem]"
    >
      {saving ? "Saving..." : submitLabel}
    </button>
  </div>
);