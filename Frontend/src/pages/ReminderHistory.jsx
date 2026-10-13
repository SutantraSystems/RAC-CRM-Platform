import React, { useEffect, useState } from "react";
import { Bell, BellPlus, Hourglass, AlarmClock, AlertTriangle, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import ModuleListPage from "../components/common/ModuleListPage";
import KpiCard from "../components/cards/KpiCard";
import ReminderFormModal from "../components/forms/ReminderFormModal";
import StatusBadge from "../components/ui/StatusBadge";
import useToast from "../hooks/useToast";
import { reminderHistoryApi } from "../services/reminderHistoryApi";
import {
  addStudentReminder,
  updateStudentReminder,
  deleteStudentReminder,
} from "../services/studentDetailsApi";
import { REMINDER_STATUS_OPTIONS, REMINDER_STATUS_TONES, getOptionLabel } from "../config/crmConfig";
import { formatDateTime, notifyRemindersChanged, apiErrorMessage } from "../utils/reminderUtils";

const loadUserOptions = async () => {
  const response = await reminderHistoryApi.users();
  return response.data.results.map((user) => ({ value: String(user.id), label: user.name }));
};

const FILTER_FIELDS = [
  { key: "search", type: "search", placeholder: "Search student, reminder, created by" },
  { key: "date_range", fromKey: "date_from", toKey: "date_to", type: "daterange" },
  { key: "user", type: "select", loadOptions: loadUserOptions, allLabel: "All Users", widthClass: "lg:w-[160px]" },
  { key: "status", type: "select", options: REMINDER_STATUS_OPTIONS, allLabel: "All Status", widthClass: "lg:w-[150px]" },
];

const COLUMNS = [
  { key: "student_name", label: "Student Name" },
  { key: "title", label: "Reminder Title", wrap: true, widthClass: "min-w-[220px] max-w-[300px]" },
  { key: "remind_at", label: "Remind At", render: (row) => formatDateTime(row.remind_at) },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge
        label={getOptionLabel(REMINDER_STATUS_OPTIONS, row.status)}
        tone={REMINDER_STATUS_TONES[row.status]}
      />
    ),
  },
  { key: "created_by_name", label: "Created By" },
  { key: "notes", label: "Notes", wrap: true, widthClass: "min-w-[280px] max-w-[400px]" },
];

const CARD_ICONS = {
  total: Bell,
  upcoming: Hourglass,
  due: AlarmClock,
  overdue: AlertTriangle,
  completed: CheckCircle2,
};

const CARD_TONES = {
  total: "primary",
  upcoming: "blue",
  due: "amber",
  overdue: "red",
  completed: "green",
};

const CARDS = [
  { key: "total", title: "Total Reminders" },
  ...REMINDER_STATUS_OPTIONS.map((o) => ({ key: o.value, title: o.label })),
];

// Counts follow the same filters as the table (except status).
function SummaryCards({ filters, reloadKey, refreshKey }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let stale = false;
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
    );

    reminderHistoryApi
      .summary(params)
      .then((response) => !stale && setCounts(response.data))
      .catch((error) => console.error("Error loading reminder summary:", error));

    return () => {
      stale = true;
    };
  }, [filters, reloadKey, refreshKey]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-2">
      {CARDS.map((card) => (
        <KpiCard
          key={card.key}
          title={card.title}
          value={counts[card.key] ?? 0}
          icon={CARD_ICONS[card.key]}
          tone={CARD_TONES[card.key]}
          variant="accent"
        />
      ))}
    </div>
  );
}

export default function ReminderHistory() {
  const { setToast, toastElement } = useToast();
  const [modal, setModal] = useState(null); // { mode: "create" | "edit", row }
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey((key) => key + 1);
    notifyRemindersChanged();
  };

  // Completed reminders can only be viewed, re-set as a new reminder, or deleted.
  const rowActions = (row, { requestDelete }) =>
    row.status === "completed"
      ? [
          { key: "new", title: "Set New Reminder", icon: BellPlus, tone: "edit", onClick: (r) => setModal({ mode: "create", row: r }) },
          { key: "delete", title: "Delete", icon: Trash2, tone: "delete", onClick: requestDelete },
        ]
      : [
          { key: "edit", title: "Edit", icon: Edit2, tone: "edit", onClick: (r) => setModal({ mode: "edit", row: r }) },
          { key: "delete", title: "Delete", icon: Trash2, tone: "delete", onClick: requestDelete },
        ];

  // Errors are rethrown so the modal shows them inline.
  const handleSubmit = async (payload) => {
    const { mode, row } = modal;

    if (mode === "create") {
      await addStudentReminder(row.student, payload);
    } else {
      await updateStudentReminder(row.id, payload);
    }

    setModal(null);
    setToast({ type: "success", message: mode === "create" ? "Reminder set." : "Reminder updated." });
    refresh();
  };

  return (
    <>
      {toastElement}

      <ModuleListPage
        api={reminderHistoryApi}
        title="Reminder History"
        singular="Reminder"
        plural="Reminders"
        filterFields={FILTER_FIELDS}
        columns={COLUMNS}
        clearLabel="Clear Filter"
        refreshKey={refreshKey}
        showTotal={false}
        onDataChanged={refresh}
        getName={(row) => `"${row.title || "this reminder"}" for ${row.student_name || "this student"}`}
        removeRecord={(row) => deleteStudentReminder(row.id)}
        deleteSuccessMessage="Reminder deleted."
        getDeleteErrorMessage={(error) => apiErrorMessage(error, "Failed to delete reminder.")}
        rowActions={rowActions}
        getRowPath={(row) => `/students/${row.student}`}
        renderAboveTable={(props) => <SummaryCards {...props} refreshKey={refreshKey} />}
      />

      {modal && (
        <ReminderFormModal
          mode={modal.mode}
          reminder={modal.mode === "edit" ? modal.row : undefined}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}