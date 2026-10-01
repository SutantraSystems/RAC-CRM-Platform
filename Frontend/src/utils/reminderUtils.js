export const IST_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30"; // India has no daylight saving time

export const FUTURE_MESSAGE = "Please select a future date and time.";

export const STATUS_META = {
  upcoming: { label: "Upcoming", badge: "bg-blue-50 text-blue-600" },
  due: { label: "Due", badge: "bg-amber-50 text-amber-700" },
  overdue: { label: "Overdue", badge: "bg-red-50 text-danger" },
  completed: { label: "Completed", badge: "bg-green-50 text-green-700" },
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const istFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// ISO string / Date -> { year, month, day, hour, minute } as numbers-in-strings, in IST.
const istParts = (value) => {
  const parts = {};
  istFormatter.formatToParts(new Date(value)).forEach((p) => {
    parts[p.type] = p.value;
  });
  return parts;
};

// Value for <input type="date"> (YYYY-MM-DD), in IST.
export const toDateInput = (value) => {
  const p = istParts(value);
  return `${p.year}-${p.month}-${p.day}`;
};

// Value for <input type="time"> (HH:MM, 24h), in IST.
export const toTimeInput = (value) => {
  const p = istParts(value);
  return `${p.hour}:${p.minute}`;
};

// Today's date in IST, for the date input's "min".
export const todayInIST = () => toDateInput(new Date());

// The IST date + time the user picked -> exact ISO string (UTC) for the API. Returns null if either is missing or invalid.
export const combineToISO = (date, time) => {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time.slice(0, 5)}:00${IST_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// "1 Oct 2026"
export const formatDate = (value) => {
  const p = istParts(value);
  return `${Number(p.day)} ${MONTHS[Number(p.month) - 1]} ${p.year}`;
};

// "10:05 AM"
export const formatTime = (value) => {
  const p = istParts(value);
  const hour = Number(p.hour);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${p.minute} ${suffix}`;
};

// "1 Oct 2026 at 10:05 AM"
export const formatDateTime = (value) =>
  `${formatDate(value)} at ${formatTime(value)}`;

// Tell the navbar bell to refresh right after a reminder changes.
export const REMINDERS_CHANGED_EVENT = "reminders:changed";
export const notifyRemindersChanged = () =>
  window.dispatchEvent(new Event(REMINDERS_CHANGED_EVENT));

// Best message to show from a failed API call.
export const apiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data || typeof data === "string") return fallback;
  if (typeof data.detail === "string") return data.detail;
  const first = Object.values(data).flat()[0];
  return typeof first === "string" ? first : fallback;
};