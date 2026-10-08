import React, { useState } from "react";
import { User, GraduationCap, Building2, Tag } from "lucide-react";
import FormField, {
  TextInput,
  OptionPills,
  FormSection,
  FormProgress,
  FormFooter,
  LABEL_CLASS,
  isFilled,
} from "../common/FormField";
import FilterDropdown from "../ui/FilterDropdown";
import YearPicker from "../ui/YearPicker";
import {
  INTAKE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_CATEGORY_OPTIONS,
  PAYMENT_DEFAULTS,
  CURRENCY_SYMBOL,
  cleanPayload,
} from "../../config/crmConfig";

const buildInitial = (data) => ({
  student_name: data.student_name || "",
  intake: data.intake || PAYMENT_DEFAULTS.intake,
  year: data.year || PAYMENT_DEFAULTS.year,
  university: data.university || "",
  amount: data.amount ?? "",
  organization: data.organization || "",
  payment_type: data.payment_type || PAYMENT_DEFAULTS.payment_type,
  status: data.status || PAYMENT_DEFAULTS.status,
  category: data.category || PAYMENT_DEFAULTS.category,
});

const SECTIONS = [
  {
    id: "student",
    title: "Student Details",
    fields: ["student_name", "university", "year", "intake"],
    counted: ["student_name", "university"],
  },
  {
    id: "payment",
    title: "Payment Details",
    fields: ["amount", "organization", "payment_type", "category", "status"],
    counted: ["amount", "organization", "category"],
  },
];

export default function PaymentForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => buildInitial(initialData));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [openIds, setOpenIds] = useState(["student", "payment"]);

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const openSection = (id) =>
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const toggleSection = (id) =>
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const showErrors = (errors) => {
    setFieldErrors(errors || {});
    // Open the first section that contains a rejected field.
    const firstBad = SECTIONS.find((s) => s.fields.some((f) => errors?.[f]));
    if (firstBad) openSection(firstBad.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.student_name.trim()) errors.student_name = "Student Name is required.";
    if (formData.amount !== "" && Number(formData.amount) < 0) {
      errors.amount = "Amount cannot be negative.";
    }

    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      return;
    }

    setSaving(true);
    const serverErrors = await onSubmit(cleanPayload(formData, ["year", "amount"]));
    setSaving(false);
    showErrors(serverErrors);
  };

  const progress = SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    filled: section.counted.filter((key) => isFilled(formData[key])).length,
    total: section.counted.length,
    hasError: section.fields.some((key) => fieldErrors[key]),
  }));

  const sectionProps = (index) => ({
    id: SECTIONS[index].id,
    title: SECTIONS[index].title,
    index,
    open: openIds.includes(SECTIONS[index].id),
    onToggle: () => toggleSection(SECTIONS[index].id),
    filled: progress[index].filled,
    total: progress[index].total,
    hasError: progress[index].hasError,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <FormProgress sections={progress} onSelect={openSection} />

      {/* 1 — STUDENT DETAILS */}
      <FormSection {...sectionProps(0)}>
        <FormField
          label="Student Name"
          htmlFor="student_name"
          required
          error={fieldErrors.student_name}
          className="sm:col-span-2"
        >
          <TextInput
            id="student_name"
            name="student_name"
            icon={<User size={16} />}
            placeholder="e.g. John Mathew"
            value={formData.student_name}
            onChange={handleChange}
            autoFocus
            error={fieldErrors.student_name}
          />
        </FormField>

        <FormField label="University" htmlFor="university" error={fieldErrors.university}>
          <TextInput
            id="university"
            name="university"
            icon={<GraduationCap size={16} />}
            placeholder="e.g. University of Toronto"
            value={formData.university}
            onChange={handleChange}
            error={fieldErrors.university}
          />
        </FormField>

        <FormField label="Intake Year" error={fieldErrors.year}>
          <YearPicker
            value={formData.year}
            onChange={(year) => setField("year", year)}
            showAll={false}
            variant="form"
          />
        </FormField>

        <div className="min-w-0 sm:col-span-2">
          <span id="intake-label" className={LABEL_CLASS}>
            Intake
          </span>
          <OptionPills
            name="intake"
            labelId="intake-label"
            value={formData.intake}
            options={INTAKE_OPTIONS}
            onChange={(val) => setField("intake", val)}
          />
        </div>
      </FormSection>

      {/* 2 — PAYMENT DETAILS */}
      <FormSection {...sectionProps(1)}>
        <FormField label="Amount" htmlFor="amount" error={fieldErrors.amount}>
          <TextInput
            id="amount"
            type="number"
            name="amount"
            min="0"
            step="0.01"
            icon={<span className="text-sm font-semibold">{CURRENCY_SYMBOL}</span>}
            placeholder="e.g. 50000"
            value={formData.amount}
            onChange={handleChange}
            error={fieldErrors.amount}
          />
        </FormField>

        <FormField label="Organization" htmlFor="organization" error={fieldErrors.organization}>
          <TextInput
            id="organization"
            name="organization"
            icon={<Building2 size={16} />}
            placeholder="e.g. ABC Education Partners"
            value={formData.organization}
            onChange={handleChange}
            error={fieldErrors.organization}
          />
        </FormField>

        <div className="min-w-0">
          <span id="payment-type-label" className={LABEL_CLASS}>
            Payment
          </span>
          <OptionPills
            name="payment_type"
            labelId="payment-type-label"
            value={formData.payment_type}
            options={PAYMENT_TYPE_OPTIONS}
            onChange={(val) => setField("payment_type", val)}
          />
        </div>

        <FormField label="Category" error={fieldErrors.category}>
          <FilterDropdown
            value={formData.category}
            onChange={(val) => setField("category", val)}
            options={PAYMENT_CATEGORY_OPTIONS}
            allLabel="Select Category"
            showAllOption={false}
            variant="form"
          />
        </FormField>

        <div className="min-w-0 sm:col-span-2">
          <span id="payment-status-label" className={LABEL_CLASS}>
            Status
          </span>
          <OptionPills
            name="status"
            labelId="payment-status-label"
            value={formData.status}
            options={PAYMENT_STATUS_OPTIONS}
            onChange={(val) => setField("status", val)}
          />
        </div>
      </FormSection>

      <FormFooter
        onCancel={onCancel}
        saving={saving}
        submitLabel={initialData?.id ? "Save Changes" : "Add Payment"}
      />
    </form>
  );
}