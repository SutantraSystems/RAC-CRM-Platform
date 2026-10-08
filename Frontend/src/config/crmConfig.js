// Rows shown per page in every list.
export const PAGE_SIZE = 25;

// Shown in front of amounts. Set to "" to show plain numbers.
export const CURRENCY_SYMBOL = "₹";

export const CURRENT_YEAR = new Date().getFullYear();

// Payment dropdown options (values match the Django model choices)
export const INTAKE_OPTIONS = [
  { value: "fall", label: "Fall" },
  { value: "spring", label: "Spring" },
  { value: "winter", label: "Winter" },
  { value: "not_sure", label: "Not Sure" },
];

export const PAYMENT_TYPE_OPTIONS = [
  { value: "due", label: "Due" },
  { value: "on_date", label: "On Date" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "payment_done", label: "Payment Done" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "half_payment_done", label: "Half Payment Done" },
];

export const PAYMENT_CATEGORY_OPTIONS = [
  { value: "university_payment", label: "University Payment" },
  { value: "prm", label: "PRM" },
  { value: "flywire", label: "Flywire" },
  { value: "el", label: "EL" },
  { value: "accommodation", label: "Accommodation" },
  { value: "test_prep", label: "Test Prep" },
];

// Values pre-selected when "Add Payment" opens.
export const PAYMENT_DEFAULTS = {
  intake: "not_sure",
  year: CURRENT_YEAR,
  payment_type: "due",
  status: "payment_pending",
  category: "",
};
// Student options (values match RACStudent on the backend)
export const countryList = [
  "Australia", "Canada", "Germany", "Ireland", "New Zealand",
  "UK", "USA", "France", "Singapore", "UAE",
];
export const COUNTRY_OPTIONS = countryList.map((c) => ({ value: c, label: c }));

// Lead status / application stage (values match RACStudent.STATUS_CHOICES).
export const STATUS_OPTIONS = [
  { value: "not_interested", label: "Not Interested" },
  { value: "interested", label: "Interested" },
  { value: "not_sure", label: "Not Sure" },
  { value: "shortlisting_done", label: "Shortlisting Done" },
  { value: "docs_shared", label: "Document Shared" },
  { value: "applied", label: "Applied" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "visa_granted", label: "Visa Granted" },
  { value: "future_intake", label: "Future Intake" },
  { value: "prm_prospect", label: "PRM Prospect" },
  { value: "no_response", label: "No Response" },
  { value: "invalid_number", label: "Invalid Number" },
];

// Progress tracker steps, in order.
export const STAGE_VALUES = [
  "interested", "shortlisting_done", "docs_shared",
  "applied", "deposit_paid", "visa_granted",
];

export const getStatusLabel = (value) =>
  STATUS_OPTIONS.find((o) => o.value === value)?.label || "Not Sure";
//  Helpers 
export const getOptionLabel = (options, value, fallback = "-") =>
  options.find((option) => option.value === value)?.label || fallback;

export const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value);
  if (Number.isNaN(number)) return String(value);

  return `${CURRENCY_SYMBOL}${number.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Trim strings, turn "" into null and convert the listed keys to numbers.
export const cleanPayload = (data, numericKeys = []) => {
  const payload = {};

  Object.keys(data).forEach((key) => {
    let value = data[key];

    if (typeof value === "string") value = value.trim();
    if (value === "") value = null;
    if (value !== null && numericKeys.includes(key)) value = Number(value);

    payload[key] = value;
  });

  return payload;
};

// First server message, used for the toast.
export const getErrorMessage = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
    if (typeof value === "string") return value;
  }
  return fallback;
};

// { field: "message" } so the form can show errors under each input.
export const getFieldErrors = (data) => {
  const errors = {};
  if (!data || typeof data !== "object") return errors;

  Object.keys(data).forEach((key) => {
    if (key === "detail") return;
    const value = Array.isArray(data[key]) ? data[key][0] : data[key];
    if (typeof value === "string") errors[key] = value;
  });
  return errors;
};