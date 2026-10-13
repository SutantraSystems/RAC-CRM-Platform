import React, { useState } from "react";
import { X } from "lucide-react";
import { LABEL_CLASS } from "../common/FormField";
import {
  combineToISO,
  toDateInput,
  toTimeInput,
  todayInIST,
  apiErrorMessage,
  FUTURE_MESSAGE,
} from "../../utils/reminderUtils";

const TITLES = {
  create: "Set Reminder",
  edit: "Edit Reminder",
  reschedule: "Reschedule Reminder",
};

const SUBMIT_LABELS = {
  create: "Set Reminder",
  edit: "Save Changes",
  reschedule: "Reschedule",
};

const defaultStart = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.toISOString();
};

export default function ReminderFormModal({ mode, reminder, onClose, onSubmit }) {
  const start = reminder?.remind_at || defaultStart();
  const isReschedule = mode === "reschedule";

  const [title, setTitle] = useState(reminder?.title || "");
  const [date, setDate] = useState(toDateInput(start));
  const [time, setTime] = useState(toTimeInput(start));
  const [notes, setNotes] = useState(reminder?.notes || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isReschedule && !title.trim()) {
      setError("Please enter a title.");
      return;
    }

    const remindAt = combineToISO(date, time);
    if (!remindAt) {
      setError("Please pick a date and time.");
      return;
    }

    const timeChanged =
      !reminder ||
      date !== toDateInput(reminder.remind_at) ||
      time !== toTimeInput(reminder.remind_at);

    if (timeChanged && new Date(remindAt) <= new Date()) {
      setError(FUTURE_MESSAGE);
      return;
    }

    let payload;
    if (isReschedule) {
      payload = { remind_at: remindAt };
    } else {
      payload = { title: title.trim(), notes: notes.trim() };
      if (timeChanged) payload.remind_at = remindAt;
    }

    try {
      setSaving(true);
      await onSubmit(payload);
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong. Please try again."));
      setSaving(false);
    }
  };

  const today = todayInIST();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-3 sm:p-4"
      onClick={() => !saving && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-white shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 sm:px-6 py-4">
          <h3
            className="font-display text-lg font-bold text-slate-900"
          >
            {TITLES[mode]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-4 sm:px-6 py-6">
          {isReschedule && (
            <p className="text-sm text-slate-500">
              Pick a new date and time for{" "}
              <span className="font-semibold text-slate-700">
                {reminder?.title}
              </span>
              .
            </p>
          )}

          {!isReschedule && (
            <div>
              <label className={LABEL_CLASS}>
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                autoFocus
                placeholder="e.g. Call about visa documents"
                className="form-control"
              />
            </div>
          )}

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className={LABEL_CLASS}>
                Date (IST) <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={date}
                min={mode === "edit" ? undefined : today}
                onChange={(e) => setDate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="min-w-0">
              <label className={LABEL_CLASS}>
                Time (IST) <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

        

          {!isReschedule && (
            <div>
              <label className={LABEL_CLASS}>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional details..."
                className="form-control resize-none"
              />
            </div>
          )}

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 break-words">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-4 sm:px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[7.5rem]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 px-7 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all duration-150 hover:bg-primary-700 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto sm:min-w-[9rem]"
          >
            {saving ? "Saving..." : SUBMIT_LABELS[mode]}
          </button>
        </div>
      </form>
    </div>
  );
}