import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2 } from "lucide-react";

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
        <div className="fixed left-3 right-3 top-[4.25rem] z-50 flex max-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[360px] sm:max-w-[calc(100vw-24px)]">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
            <p className="text-sm font-bold text-slate-800">Reminders</p>

            {count > 0 && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">
                {count}
              </span>
            )}
          </div>

          {/* List */}
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-2.5 pb-2.5">
            {!loaded ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary-600" />
              </div>
            ) : count === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 size={22} className="text-emerald-500" />
                <p className="mt-2 text-sm font-semibold text-slate-700">All caught up</p>
                <p className="text-xs text-slate-400">No due or overdue reminders.</p>
              </div>
            ) : (
              items.map((item) => {
                const meta = STATUS_META[item.status] || STATUS_META.due;
                const isOverdue = item.status === "overdue";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => viewStudent(item)}
                    className="group relative block w-full overflow-hidden rounded-xl bg-slate-50 py-2 pl-4 pr-3 text-left transition-colors hover:bg-primary-50"
                  >
                    {/* Status accent bar */}
                    <span
                      className={`absolute inset-y-0 left-0 w-1 ${isOverdue ? "bg-danger" : "bg-amber-400"}`}
                    />

                    {/* Line 1: student (left) / status (right) */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[13px] font-bold text-slate-800">{item.student_name}</p>
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Line 2: title (left) / timestamp (right) */}
                    <div className="mt-0.5 flex items-center justify-between gap-3">
                      <p title={item.title} className="min-w-0 flex-1 truncate text-xs font-medium leading-snug text-slate-600">{item.title}</p>
                      <span className="shrink-0 whitespace-nowrap text-[11px] font-semibold leading-snug text-slate-700">
                        {formatDateTime(item.remind_at)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}