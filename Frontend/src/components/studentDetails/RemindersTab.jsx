import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Bell,
  Check,
  CheckCircle2,
  CalendarClock,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  AlarmClock,
  Hourglass,
  Loader2,
  MoreVertical,
} from "lucide-react";

import {
  getStudentReminders,
  addStudentReminder,
  updateStudentReminder,
  completeStudentReminder,
  rescheduleStudentReminder,
  deleteStudentReminder,
} from "../../services/studentDetailsApi";

import ReminderFormModal from "../ui/ReminderFormModal";

import {
  formatDate,
  formatTime,
  formatDateTime,
  notifyRemindersChanged,
  apiErrorMessage,
} from "../../utils/reminderUtils";

const REFRESH_MS = 60 * 1000;

const STATUS_STYLES = {
  upcoming: {
    label: "Upcoming",
    icon: Hourglass,
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-50 text-blue-600",
  },

  due: {
    label: "Due",
    icon: AlarmClock,
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-50 text-amber-600",
  },

  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    iconBg: "bg-red-50 text-red-600",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
    iconBg: "bg-green-50 text-green-600",
  },
};

const relativeText = (iso, status) => {
  const difference =
    new Date(iso).getTime() - Date.now();

  const abs = Math.abs(difference);

  const minutes = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);

  let amount = "";

  if (minutes >= 1 && minutes < 60) {
    amount = `${minutes} min`;
  } else if (hours >= 1 && hours < 24) {
    amount = `${hours} hr`;
  } else if (days >= 1) {
    amount = `${days} day${days > 1 ? "s" : ""}`;
  }

  if (status === "upcoming") {
    return amount ? `In ${amount}` : "Starting now";
  }

  if (status === "due") {
    return amount ? `Due ${amount} ago` : "Due now";
  }

  if (status === "overdue") {
    return amount ? `Overdue by ${amount}` : "Overdue";
  }

  return "";
};

function StatusBadge({ status }) {
  const style =
    STATUS_STYLES[status] ||
    STATUS_STYLES.upcoming;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {style.label}
    </span>
  );
}

function ReminderItem({
  reminder,
  busy,
  onComplete,
  onReschedule,
  onEdit,
  onDelete,
}) {
  const { status } = reminder;

  const style =
    STATUS_STYLES[status] ||
    STATUS_STYLES.upcoming;

  const Icon = style.icon;

  const needsAction =
    status === "due" ||
    status === "overdue";

  const completed =
    status === "completed";

  return (
    <div
      className={`group relative border-b border-slate-200 px-5 py-4 transition-colors last:border-b-0 ${
        completed
          ? "bg-slate-50/60"
          : "bg-white hover:bg-slate-50/70"
      }`}
    >
      <div className="flex gap-4">

        {/* Icon */}
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
        >
          <Icon size={18} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">

          {/* Title + Status */}
          <div className="flex flex-wrap items-start justify-between gap-3">

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">

                <h4
                  className={`text-[15px] font-semibold ${
                    completed
                      ? "text-slate-500 line-through"
                      : "text-slate-900"
                  }`}
                >
                  {reminder.title}
                </h4>

                <StatusBadge status={status} />
              </div>

              {/* Student / creator */}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">

                {reminder.created_by_name && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    Set by {reminder.created_by_name}
                  </span>
                )}

                {!completed && (
                  <span
                    className={`font-semibold ${
                      status === "overdue"
                        ? "text-red-600"
                        : status === "due"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }`}
                  >
                    {relativeText(
                      reminder.remind_at,
                      status
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Date/time */}
            <div className="flex shrink-0 items-center gap-3 text-xs font-medium text-slate-600">

              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(reminder.remind_at)}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {formatTime(reminder.remind_at)} IST
              </span>

            </div>
          </div>

          {/* Notes */}
          {reminder.notes && (
            <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-sm leading-5 text-slate-600">
                {reminder.notes}
              </p>
            </div>
          )}

          {/* Completed history */}
          {completed &&
            reminder.completed_at && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-green-700">

                <CheckCircle2 size={14} />

                <span>
                  Completed by{" "}
                  {reminder.completed_by_name ||
                    "Unknown"}{" "}
                  on{" "}
                  {formatDateTime(
                    reminder.completed_at
                  )}
                </span>

              </div>
            )}

          {/* Actions */}
          {!completed && (
            <div className="mt-4 flex flex-wrap items-center gap-2">

              {needsAction && (
                <>
                  <button
                    onClick={() =>
                      onComplete(reminder)
                    }
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={13} />
                    Done
                  </button>

                  <button
                    onClick={() =>
                      onReschedule(reminder)
                    }
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    <CalendarClock size={13} />
                    Reschedule
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  onEdit(reminder)
                }
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <Pencil size={13} />
                Edit
              </button>

              <button
                onClick={() =>
                  onDelete(reminder)
                }
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={13} />
                Delete
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function ReminderSection({
  title,
  count,
  dot,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-5 py-3">

        <div className="flex items-center gap-2">

          <span
            className={`h-2.5 w-2.5 rounded-full ${dot}`}
          />

          <h4 className="text-sm font-bold text-slate-800">
            {title}
          </h4>

          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
            {count}
          </span>

        </div>

      </div>

      <div>{children}</div>

    </section>
  );
}

export default function RemindersTab({
  studentId,
  setToast,
}) {
  const [reminders, setReminders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [modal, setModal] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [busyId, setBusyId] =
    useState(null);

  const [filter, setFilter] =
    useState("all");

  const fetchReminders = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const response =
          await getStudentReminders(
            studentId
          );

        setReminders(response.data);
      } catch (error) {
        console.error(
          "Failed to load reminders:",
          error
        );

        if (!silent) {
          setToast({
            type: "error",
            message:
              "Failed to load reminders.",
          });
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [studentId, setToast]
  );

  useEffect(() => {
    fetchReminders();

    const timer = setInterval(
      () => fetchReminders(true),
      REFRESH_MS
    );

    return () =>
      clearInterval(timer);
  }, [fetchReminders]);

  const refreshAll = async () => {
    await fetchReminders(true);
    notifyRemindersChanged();
  };

  /* -------------------------------------------------------
     CREATE / EDIT / RESCHEDULE
  ------------------------------------------------------- */

  const handleModalSubmit = async (
    payload
  ) => {
    const { mode, reminder } = modal;

    try {
      if (mode === "create") {
        await addStudentReminder(
          studentId,
          payload
        );
      } else if (mode === "edit") {
        await updateStudentReminder(
          reminder.id,
          payload
        );
      } else {
        await rescheduleStudentReminder(
          reminder.id,
          payload.remind_at
        );
      }

      setModal(null);

      setToast({
        type: "success",
        message:
          mode === "create"
            ? "Reminder set."
            : mode === "edit"
            ? "Reminder updated."
            : "Reminder rescheduled.",
      });

      await refreshAll();
    } catch (error) {
      console.error(
        "Reminder operation failed:",
        error
      );

      setToast({
        type: "error",
        message: apiErrorMessage(
          error,
          "Failed to update reminder."
        ),
      });
    }
  };

  const handleComplete = async (
    reminder
  ) => {
    try {
      setBusyId(reminder.id);

      await completeStudentReminder(
        reminder.id
      );

      setToast({
        type: "success",
        message:
          "Reminder marked as done.",
      });

      await refreshAll();
    } catch (error) {
      console.error(
        "Failed to complete reminder:",
        error
      );

      setToast({
        type: "error",
        message: apiErrorMessage(
          error,
          "Failed to complete reminder."
        ),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteStudentReminder(
        deleteTarget.id
      );

      setToast({
        type: "success",
        message: "Reminder deleted.",
      });

      await refreshAll();
    } catch (error) {
      console.error(
        "Failed to delete reminder:",
        error
      );

      setToast({
        type: "error",
        message: apiErrorMessage(
          error,
          "Failed to delete reminder."
        ),
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const byTime = (a, b) =>
    new Date(a.remind_at) -
    new Date(b.remind_at);

  const needsAction = reminders
    .filter(
      (r) =>
        r.status === "due" ||
        r.status === "overdue"
    )
    .sort(byTime);

  const upcoming = reminders
    .filter(
      (r) => r.status === "upcoming"
    )
    .sort(byTime);

  const completed = reminders
    .filter(
      (r) => r.status === "completed"
    )
    .sort(
      (a, b) =>
        new Date(b.completed_at) -
        new Date(a.completed_at)
    );

  const FILTERS = [
    {
      key: "all",
      label: "All",
      count: reminders.length,
    },
    {
      key: "attention",
      label: "Needs Attention",
      count: needsAction.length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: upcoming.length,
    },
    {
      key: "completed",
      label: "Completed",
      count: completed.length,
    },
  ];

  const show =
    filter === "all" || filter === "attention"
      ? true
      : false;

  const renderReminder = (reminder) => (
    <ReminderItem
      key={reminder.id}
      reminder={reminder}
      busy={busyId === reminder.id}
      onComplete={handleComplete}
      onReschedule={(rem) =>
        setModal({
          mode: "reschedule",
          reminder: rem,
        })
      }
      onEdit={(rem) =>
        setModal({
          mode: "edit",
          reminder: rem,
        })
      }
      onDelete={setDeleteTarget}
    />
  );

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Reminders
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Follow-ups and tasks for this student.
          </p>
        </div>

        <button
          onClick={() =>
            setModal({
              mode: "create",
              reminder: null,
            })
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          <Plus size={17} />
          Set Reminder
        </button>

      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-12">

          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Loader2
              size={17}
              className="animate-spin"
            />
            Loading reminders...
          </div>

        </div>
      ) : reminders.length === 0 ? (

        /* EMPTY STATE */
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <Bell
              size={22}
              className="text-slate-500"
            />
          </div>

          <h4 className="mt-4 text-sm font-semibold text-slate-800">
            No reminders yet
          </h4>

          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Create a reminder to keep track of
            follow-ups for this student.
          </p>

          <button
            onClick={() =>
              setModal({
                mode: "create",
                reminder: null,
              })
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <Plus size={16} />
            Set Reminder
          </button>

        </div>
      ) : (

        <>
          {/* FILTER NAVIGATION */}
          <div className="overflow-x-auto border-b border-slate-200">

            <div className="flex min-w-max gap-6">

              {FILTERS.map((item) => {
                const active =
                  filter === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      setFilter(item.key)
                    }
                    className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
                      active
                        ? "text-primary-600"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {item.label}

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-primary-100 text-primary-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.count}
                    </span>

                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-600" />
                    )}
                  </button>
                );
              })}

            </div>

          </div>

          {/* ALL */}
          {filter === "all" && (
            <div className="space-y-5">

              {needsAction.length > 0 && (
                <ReminderSection
                  title="Needs Attention"
                  count={needsAction.length}
                  dot="bg-red-500"
                >
                  {needsAction.map(
                    renderReminder
                  )}
                </ReminderSection>
              )}

              {upcoming.length > 0 && (
                <ReminderSection
                  title="Upcoming"
                  count={upcoming.length}
                  dot="bg-blue-500"
                >
                  {upcoming.map(
                    renderReminder
                  )}
                </ReminderSection>
              )}

              {completed.length > 0 && (
                <ReminderSection
                  title="Completed"
                  count={completed.length}
                  dot="bg-green-500"
                >
                  {completed.map(
                    renderReminder
                  )}
                </ReminderSection>
              )}

            </div>
          )}

          {/* NEEDS ATTENTION */}
          {filter === "attention" && (
            needsAction.length > 0 ? (
              <ReminderSection
                title="Needs Attention"
                count={needsAction.length}
                dot="bg-red-500"
              >
                {needsAction.map(
                  renderReminder
                )}
              </ReminderSection>
            ) : (
              <EmptyFilter
                message="No reminders need attention."
              />
            )
          )}

          {/* UPCOMING */}
          {filter === "upcoming" && (
            upcoming.length > 0 ? (
              <ReminderSection
                title="Upcoming"
                count={upcoming.length}
                dot="bg-blue-500"
              >
                {upcoming.map(
                  renderReminder
                )}
              </ReminderSection>
            ) : (
              <EmptyFilter
                message="No upcoming reminders."
              />
            )
          )}

          {/* COMPLETED */}
          {filter === "completed" && (
            completed.length > 0 ? (
              <ReminderSection
                title="Completed"
                count={completed.length}
                dot="bg-green-500"
              >
                {completed.map(
                  renderReminder
                )}
              </ReminderSection>
            ) : (
              <EmptyFilter
                message="No completed reminders."
              />
            )
          )}
        </>
      )}

      {/* CREATE / EDIT / RESCHEDULE MODAL */}
      {modal && (
        <ReminderFormModal
          mode={modal.mode}
          reminder={modal.reminder}
          onClose={() =>
            setModal(null)
          }
          onSubmit={handleModalSubmit}
        />
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            !deleting &&
            setDeleteTarget(null)
          }
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <h3 className="text-base font-semibold text-slate-900">
                Delete Reminder?
              </h3>

              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <div className="px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Trash2
                    size={18}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Delete this reminder?
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    "{deleteTarget.title}"
                    <br />
                  </p>
                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleConfirmDelete
                }
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Reminder"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function EmptyFilter({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">

      <CheckCircle2
        size={24}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-sm font-medium text-slate-500">
        {message}
      </p>

    </div>
  );
}