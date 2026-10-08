import React, { useState, useEffect } from "react";
import {
  User,
  CalendarDays,
  Phone,
  PhoneCall,
  Mail,
  FileText,
  Users,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";
import YearPicker from "../ui/YearPicker";
import FilterDropdown from "../ui/FilterDropdown";
import {
  COUNTRY_OPTIONS,
  STATUS_OPTIONS,
  INTAKE_OPTIONS,
  CURRENCY_SYMBOL,
} from "../../config/crmConfig";
import FormField, {
  TextInput,
  OptionPills,
  FormSection,
  FormProgress,
  FormFooter,
  LABEL_CLASS,
  isFilled,
} from "../common/FormField";
import { getStudentSourceFiles } from "../../services/studentApi";

const SECTIONS = [
  {
    id: "personal",
    title: "Personal Details",
    fields: [
      "full_name", "dob", "mobile_number", "alternate_mobile_number",
      "email", "passport_number", "parent_name", "address",
    ],
    counted: [
      "full_name", "dob", "mobile_number", "alternate_mobile_number",
      "email", "passport_number", "parent_name", "address",
    ],
  },
  {
    id: "study",
    title: "Education & Study Plan",
    fields: [
      "preferred_country", "year", "intake", "budget",
      "test_score", "academic_details", "work_experience",
    ],
    counted: [
      "preferred_country", "intake", "budget",
      "test_score", "academic_details", "work_experience",
    ],
  },
  {
    id: "lead",
    title: "Lead Details",
    fields: ["status", "source_file"],
    counted: ["source_file"],
  },
];

export default function StudentForm({
  initialData = {},
  onSubmit,
  onCancel,
}) {

  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    dob: initialData.dob || "",
    mobile_number: initialData.mobile_number || "",
    alternate_mobile_number: initialData.alternate_mobile_number || "",
    email: initialData.email || "",
    passport_number: initialData.passport_number || "",
    academic_details: initialData.academic_details || "",
    test_score: initialData.test_score ?? "",
    preferred_country: initialData.preferred_country || "",
    intake: initialData.intake || "",
    year: initialData.year || 2026,
    budget: initialData.budget ?? "",
    work_experience: initialData.work_experience || "",
    address: initialData.address || "",
    parent_name: initialData.parent_name || "",
    source_file: initialData.source_file || "",
    status: initialData.status || "not_sure",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [useOther, setUseOther] = useState(false);
  const [openIds, setOpenIds] = useState(["personal"]);

  useEffect(() => {
    getStudentSourceFiles()
      .then((res) => {
        setSourceOptions(
          res.data.source_files.map((f) => ({ value: f, label: f }))
        );
      })
      .catch((err) => console.error("Failed to load source files:", err));
  }, []);

  const OTHERS_VALUE = "__others__";
  const dropdownOptions = [
    ...sourceOptions,
    { value: OTHERS_VALUE, label: "Others" },
  ];

  const clearError = (key) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const handleChange = (e) => handleFieldChange(e.target.name, e.target.value);

  const handleSourceSelect = (val) => {
    if (val === OTHERS_VALUE) {
      setUseOther(true);
      handleFieldChange("source_file", "");
    } else {
      setUseOther(false);
      handleFieldChange("source_file", val);
    }
  };

  const openSection = (id) =>
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const toggleSection = (id) =>
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {};

    Object.keys(formData).forEach((key) => {
      let value = formData[key];

      if (typeof value === "string") {
        value = value.trim();
      }

      if (value === "") {
        value = null;
      }

      if (
        value !== null &&
        (key === "test_score" || key === "budget" || key === "year")
      ) {
        value = Number(value);
      }

      payload[key] = value;
    });

    setSaving(true);
    // onSubmit may resolve to { field: "message" } when the server rejects it.
    const errors = await onSubmit(payload);
    setSaving(false);
    setFieldErrors(errors || {});

    // Open the first section that contains a rejected field.
    const firstBad = SECTIONS.find((s) => s.fields.some((f) => errors?.[f]));
    if (firstBad) openSection(firstBad.id);
  };

  // Progress per section, drawn as the segmented bar at the top.
  const progress = SECTIONS.map((section) => ({
    filled: section.counted.filter((key) => isFilled(formData[key])).length,
    total: section.counted.length,
    hasError: section.fields.some((key) => fieldErrors[key]),
  }));

  // Server errors that do not belong to any field (shown above the buttons).
  const knownFields = SECTIONS.flatMap((s) => s.fields);
  const generalErrors = Object.entries(fieldErrors).filter(
    ([key, message]) => message && !knownFields.includes(key)
  );

  const isEdit = Boolean(initialData?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <FormProgress
        sections={SECTIONS.map((section, i) => ({ id: section.id, title: section.title, ...progress[i] }))}
        onSelect={openSection}
      />

      {/* 1 — PERSONAL DETAILS */}
      <FormSection
        id={SECTIONS[0].id}
        title={SECTIONS[0].title}
        index={0}
        open={openIds.includes("personal")}
        onToggle={() => toggleSection("personal")}
        {...progress[0]}
      >
        <FormField label="Full Name" htmlFor="full_name" error={fieldErrors.full_name}>
          <TextInput
            id="full_name"
            name="full_name"
            icon={<User size={16} />}
            placeholder="e.g. John Mathew"
            value={formData.full_name}
            onChange={handleChange}
            error={fieldErrors.full_name}
          />
        </FormField>

        <FormField label="Date of Birth" htmlFor="dob" error={fieldErrors.dob}>
          <TextInput
            id="dob"
            type="date"
            name="dob"
            icon={<CalendarDays size={16} />}
            value={formData.dob}
            onChange={handleChange}
            error={fieldErrors.dob}
          />
        </FormField>

        <FormField
          label="Mobile Number"
          htmlFor="mobile_number"
          error={fieldErrors.mobile_number}
          hint="More than one number? Separate them with a comma. Extra numbers are saved as alternate numbers."
        >
          <TextInput
            id="mobile_number"
            name="mobile_number"
            inputMode="tel"
            icon={<Phone size={16} />}
            placeholder="e.g. 9876543210"
            value={formData.mobile_number}
            onChange={handleChange}
            error={fieldErrors.mobile_number}
          />
        </FormField>

        <FormField
          label="Alternate Mobile Number"
          htmlFor="alternate_mobile_number"
          error={fieldErrors.alternate_mobile_number}
          hint="Optional. Separate several numbers with commas."
        >
          <TextInput
            id="alternate_mobile_number"
            name="alternate_mobile_number"
            inputMode="tel"
            icon={<PhoneCall size={16} />}
            placeholder="e.g. 9123456789"
            value={formData.alternate_mobile_number}
            onChange={handleChange}
            error={fieldErrors.alternate_mobile_number}
          />
        </FormField>

        <FormField label="Email Address" htmlFor="email" error={fieldErrors.email}>
          <TextInput
            id="email"
            type="email"
            name="email"
            icon={<Mail size={16} />}
            placeholder="e.g. john@email.com"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />
        </FormField>

        <FormField label="Passport Number" htmlFor="passport_number" error={fieldErrors.passport_number}>
          <TextInput
            id="passport_number"
            name="passport_number"
            icon={<FileText size={16} />}
            placeholder="e.g. P1234567"
            value={formData.passport_number}
            onChange={handleChange}
            error={fieldErrors.passport_number}
          />
        </FormField>

        <FormField label="Parent Name" htmlFor="parent_name" error={fieldErrors.parent_name} className="sm:col-span-2">
          <TextInput
            id="parent_name"
            name="parent_name"
            icon={<Users size={16} />}
            placeholder="e.g. Mary Mathew"
            value={formData.parent_name}
            onChange={handleChange}
            error={fieldErrors.parent_name}
          />
        </FormField>

        <FormField label="Address" htmlFor="address" error={fieldErrors.address} className="sm:col-span-2">
          <div className="relative">
            <MapPin size={16} className="pointer-events-none absolute left-4 top-4 text-slate-500" />
            <textarea
              id="address"
              name="address"
              rows={3}
              placeholder="House name, street, city, state, PIN"
              value={formData.address}
              onChange={handleChange}
              className="form-control resize-none pl-11"
            />
          </div>
        </FormField>
      </FormSection>

      {/* 2 — EDUCATION & STUDY PLAN */}
      <FormSection
        id={SECTIONS[1].id}
        title={SECTIONS[1].title}
        index={1}
        open={openIds.includes("study")}
        onToggle={() => toggleSection("study")}
        {...progress[1]}
      >
        <FormField label="Preferred Country" error={fieldErrors.preferred_country}>
          <FilterDropdown
            value={formData.preferred_country}
            onChange={(val) => handleFieldChange("preferred_country", val)}
            options={COUNTRY_OPTIONS}
            allLabel="Select Country"
            variant="form"
          />
        </FormField>

        <FormField label="Intake Year" error={fieldErrors.year}>
          <YearPicker
            value={formData.year}
            onChange={(year) => handleFieldChange("year", year)}
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
            onChange={(val) => handleFieldChange("intake", val)}
          />
        </div>

        <FormField label="Budget" htmlFor="budget" error={fieldErrors.budget}>
          <TextInput
            id="budget"
            type="number"
            name="budget"
            icon={<span className="text-sm font-semibold">{CURRENCY_SYMBOL}</span>}
            placeholder="e.g. 500000"
            value={formData.budget}
            onChange={handleChange}
            error={fieldErrors.budget}
          />
        </FormField>

        <FormField label="Test Score" htmlFor="test_score" error={fieldErrors.test_score}>
          <TextInput
            id="test_score"
            type="number"
            step="any"
            name="test_score"
            icon={<Award size={16} />}
            placeholder="e.g. 7.5"
            value={formData.test_score}
            onChange={handleChange}
            error={fieldErrors.test_score}
          />
        </FormField>

        <FormField label="Academic Details" htmlFor="academic_details" error={fieldErrors.academic_details}>
          <TextInput
            id="academic_details"
            name="academic_details"
            icon={<GraduationCap size={16} />}
            placeholder="e.g. B.Sc Computer Science"
            value={formData.academic_details}
            onChange={handleChange}
            error={fieldErrors.academic_details}
          />
        </FormField>

        <FormField label="Work Experience" htmlFor="work_experience" error={fieldErrors.work_experience}>
          <TextInput
            id="work_experience"
            name="work_experience"
            icon={<Briefcase size={16} />}
            placeholder="e.g. 2 years"
            value={formData.work_experience}
            onChange={handleChange}
            error={fieldErrors.work_experience}
          />
        </FormField>
      </FormSection>

      {/* 3 — LEAD DETAILS */}
      <FormSection
        id={SECTIONS[2].id}
        title={SECTIONS[2].title}
        index={2}
        open={openIds.includes("lead")}
        onToggle={() => toggleSection("lead")}
        {...progress[2]}
      >
        <FormField label="Status" error={fieldErrors.status}>
          <FilterDropdown
            value={formData.status}
            onChange={(val) => handleFieldChange("status", val)}
            options={STATUS_OPTIONS}
            showAllOption={false}
            variant="form"
          />
        </FormField>

        <FormField label="Source File" error={fieldErrors.source_file}>
          <FilterDropdown
            value={useOther ? OTHERS_VALUE : formData.source_file}
            onChange={handleSourceSelect}
            options={dropdownOptions}
            allLabel="Select Source File"
            variant="form"
          />
        </FormField>

        {useOther && (
          <FormField label="Other Source" htmlFor="source_file" className="sm:col-span-2">
            <TextInput
              id="source_file"
              name="source_file"
              placeholder="Enter source file name"
              value={formData.source_file}
              onChange={handleChange}
              autoFocus
            />
          </FormField>
        )}
      </FormSection>

      {/* ERRORS THAT DO NOT BELONG TO A FIELD */}
      {generalErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {generalErrors.map(([key, message]) => (
            <p key={key}>{String(message)}</p>
          ))}
        </div>
      )}

      <FormFooter
        onCancel={onCancel}
        saving={saving}
        submitLabel={isEdit ? "Save Changes" : "Add Student"}
      />

    </form>
  );
}