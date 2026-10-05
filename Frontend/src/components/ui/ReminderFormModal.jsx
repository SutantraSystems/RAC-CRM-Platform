import React, { useState } from "react";
import { X } from "lucide-react";
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={() => !saving && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 sm:px-6 py-4">
          <h3
            className="text-base font-semibold text-slate-800"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {TITLES[mode]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-4 sm:px-6 py-5">
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
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                autoFocus
                placeholder="e.g. Call about visa documents"
                className="input-field w-full"
              />
            </div>
          )}

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Date (IST) <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={date}
                min={mode === "edit" ? undefined : today}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Time (IST) <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>

        

          {!isReschedule && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional details..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          )}

          {error && <p className="text-sm text-danger break-words">{error}</p>}
        </div>

        <div className="flex flex-wrap justify-end gap-2 sm:gap-3 border-t border-slate-100 px-4 sm:px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-outline rounded-xl px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary rounded-xl px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : SUBMIT_LABELS[mode]}
          </button>
        </div>
      </form>
    </div>
  );
}