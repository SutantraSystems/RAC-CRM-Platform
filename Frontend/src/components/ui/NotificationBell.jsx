import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { getReminderNotifications } from "../../services/studentDetailsApi";

import {
  STATUS_META,
  formatDateTime,
  REMINDERS_CHANGED_EVENT,
} from "../../utils/reminderUtils";

const POLL_MS = 60 * 1000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getReminderNotifications();

      setItems(response.data.results || []);
    } catch (error) {
      console.error("Failed to load reminder notifications:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const timer = setInterval(fetchNotifications, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    window.addEventListener(
      REMINDERS_CHANGED_EVENT,
      fetchNotifications
    );

    return () => {
      clearInterval(timer);

      document.removeEventListener("visibilitychange", onVisible);

      window.removeEventListener(
        REMINDERS_CHANGED_EVENT,
        fetchNotifications
      );
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggle = () => {
    if (!open) {
      fetchNotifications();
    }

    setOpen((prev) => !prev);
  };

  const viewStudent = (item) => {
    setOpen(false);

    navigate(`/students/${item.student}?tab=Reminders`);
  };

  const count = items.length;

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggle}
        title="Reminders"
        aria-label={`Reminders${
          count ? `, ${count} need attention` : ""
        }`}
        className="relative rounded-xl p-2.5 text-slate-500 transition-all duration-200 hover:bg-primary-50 hover:text-primary-600"
      >
        <Bell size={21} strokeWidth={2} />

        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold leading-none text-white shadow-sm">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed left-3 right-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-14 sm:w-[420px] sm:max-w-[calc(100vw-24px)]">
          {/* Header */}
          <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Bell size={19} strokeWidth={2} />
                </div>

                <div>
                  <p className="text-base font-semibold text-slate-800">
                    Reminders
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Due and overdue reminders
                  </p>
                </div>
              </div>

              {count > 0 && (
                <span className="shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-danger">
                  {count} need{count === 1 ? "s" : ""} attention
                </span>
              )}
            </div>
          </div>

          {/* Reminder List */}
          <div className="max-h-[60vh] sm:max-h-[480px] overflow-y-auto">
            {/* Loading */}
            {!loaded ? (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />

                <p className="text-sm text-slate-500">
                  Loading reminders...
                </p>
              </div>
            ) : count === 0 ? (
              /* Empty */
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={25} strokeWidth={2} />
                </div>

                <p className="mt-4 text-base font-semibold text-slate-700">
                  You're all caught up
                </p>

                <p className="mt-1.5 max-w-[280px] text-sm leading-6 text-slate-400">
                  There are no due or overdue reminders right now.
                </p>
              </div>
            ) : (
              /* Items */
              items.map((item) => {
                const meta =
                  STATUS_META[item.status] || STATUS_META.due;

                const isOverdue = item.status === "overdue";

                return (
                  <div
                    key={item.id}
                    className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4 transition-colors duration-150 last:border-0 hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Reminder Icon */}
                      <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isOverdue
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {isOverdue ? (
                          <AlertTriangle
                            size={18}
                            strokeWidth={2}
                          />
                        ) : (
                          <Clock size={18} strokeWidth={2} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        {/* Student + Status */}
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                            {item.student_name}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${meta.badge}`}
                          >
                            {meta.label}
                          </span>
                        </div>

                        {/* Reminder title */}
                        <p className="mt-2 text-sm font-medium leading-5 text-slate-700 break-words">
                          {item.title}
                        </p>

                        {/* Date / Time */}
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Calendar
                            size={14}
                            strokeWidth={1.8}
                            className="shrink-0"
                          />

                          <span>
                            {formatDateTime(item.remind_at)}
                          </span>
                        </div>

                        {/* Notes */}
                        {item.notes && (
                          <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-slate-500">
                            {item.notes}
                          </p>
                        )}

                        {/* View Student */}
                        <button
                          type="button"
                          onClick={() => viewStudent(item)}
                          className="mt-3 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 hover:underline"
                        >
                          View Student →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 px-4 sm:px-5 py-3">
              <p className="text-center text-xs text-slate-400">
                Reminders refresh automatically every minute
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}