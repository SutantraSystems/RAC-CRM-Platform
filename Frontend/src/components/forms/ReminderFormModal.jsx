import React, { useState } from "react";
import { Bell, CalendarDays, Clock, FileText } from "lucide-react";
import FormModal from "../common/FormModal";
import FormField, { TextInput, FormSection, FormFooter } from "../common/FormField";
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

// Same modal, single section and footer as the Contact List form.
export default function ReminderFormModal({ mode, reminder, onClose, onSubmit }) {
  const start = reminder?.remind_at || defaultStart();
  const isReschedule = mode === "reschedule";

  const [title, setTitle] = useState(reminder?.title || "");
  const [date, setDate] = useState(toDateInput(start));
  const [time, setTime] = useState(toTimeInput(start));
  const [notes, setNotes] = useState(reminder?.notes || "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const clearError = (key) =>
    errors[key] && setErrors((prev) => ({ ...prev, [key]: undefined }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const nextErrors = {};
    if (!isReschedule && !title.trim()) nextErrors.title = "Title is required.";
    if (!date) nextErrors.date = "Please pick a date.";
    if (!time) nextErrors.time = "Please pick a time.";

    const remindAt = combineToISO(date, time);
    const timeChanged =
      !reminder ||
      date !== toDateInput(reminder.remind_at) ||
      time !== toTimeInput(reminder.remind_at);

    if (remindAt && timeChanged && new Date(remindAt) <= new Date()) {
      nextErrors.time = FUTURE_MESSAGE;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = isReschedule
      ? { remind_at: remindAt }
      : { title: title.trim(), notes: notes.trim(), ...(timeChanged && { remind_at: remindAt }) };

    try {
      setSaving(true);
      await onSubmit(payload);
    } catch (err) {
      setFormError(apiErrorMessage(err, "Something went wrong. Please try again."));
      setSaving(false);
    }
  };

  return (
    <FormModal title={TITLES[mode]} onClose={() => !saving && onClose()}>
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {formError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 break-words">
            {formError}
          </p>
        )}

        <FormSection id="reminder" title={isReschedule ? "New Date & Time" : "Reminder Details"}>
          {isReschedule && (
            <p className="text-sm text-slate-500 sm:col-span-2">
              Pick a new date and time for{" "}
              <span className="font-semibold text-slate-700">{reminder?.title}</span>.
            </p>
          )}

          {!isReschedule && (
            <FormField label="Title" htmlFor="reminder_title" required error={errors.title} className="sm:col-span-2">
              <TextInput
                id="reminder_title"
                icon={<Bell size={16} />}
                placeholder="e.g. Call about visa documents"
                value={title}
                maxLength={255}
                autoFocus
                error={errors.title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
              />
            </FormField>
          )}

          <FormField label="Date (IST)" htmlFor="reminder_date" required error={errors.date}>
            <TextInput
              id="reminder_date"
              type="date"
              icon={<CalendarDays size={16} />}
              value={date}
              min={mode === "edit" ? undefined : todayInIST()}
              error={errors.date}
              onChange={(e) => {
                setDate(e.target.value);
                clearError("date");
                clearError("time");
              }}
            />
          </FormField>

          <FormField label="Time (IST)" htmlFor="reminder_time" required error={errors.time}>
            <TextInput
              id="reminder_time"
              type="time"
              icon={<Clock size={16} />}
              value={time}
              error={errors.time}
              onChange={(e) => {
                setTime(e.target.value);
                clearError("time");
              }}
            />
          </FormField>

          {!isReschedule && (
            <FormField label="Notes" htmlFor="reminder_notes" className="sm:col-span-2">
              <TextInput
                id="reminder_notes"
                icon={<FileText size={16} />}
                placeholder="Optional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>
          )}
        </FormSection>

        <FormFooter onCancel={onClose} saving={saving} submitLabel={SUBMIT_LABELS[mode]} />
      </form>
    </FormModal>
  );
}