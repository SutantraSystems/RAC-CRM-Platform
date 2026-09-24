import React, { useState } from "react";
import YearPicker from "../ui/YearPicker";
import FilterDropdown from "../ui/FilterDropdown";
import { countryList } from "../../data/students";

const countryOptions = countryList.map((c) => ({ value: c, label: c }));

const intakeOptions = [
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "not_sure", label: "Not Sure" },
];

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-500">{label}</label>
    {children}
  </div>
);

export default function StudentForm({
  initialData = {},
  onSubmit,
  onCancel,
}) {

  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    dob: initialData.dob || "",
    mobile_number: initialData.mobile_number || "",
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
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {};

    Object.keys(formData).forEach((key) => {
      let value = formData[key];

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
  };

  return (
    // The modal, header and close button are provided by the parent (Students.jsx).
    <form onSubmit={handleSubmit} className="space-y-3">

          {/* ROW 1 */}
          <div className="grid grid-cols-3 gap-2">
            <Field label="Full Name">
              <input
                name="full_name"
                placeholder="e.g. John Mathew"
                value={formData.full_name}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </Field>

            <Field label="Mobile Number">
              <input
                name="mobile_number"
                placeholder="e.g. 9876543210"
                value={formData.mobile_number}
                onChange={handleChange}
                className={`px-3 py-2 text-sm border rounded-lg ${fieldErrors.mobile_number ? "border-red-400" : "border-slate-200"}`}
              />
              {fieldErrors.mobile_number && (
                <p className="text-xs text-red-500">{fieldErrors.mobile_number}</p>
              )}
            </Field>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-3 gap-2">
            <Field label="Email">
              <input
                type="email"
                name="email"
                placeholder="e.g. john@email.com"
                value={formData.email}
                onChange={handleChange}
                className={`px-3 py-2 text-sm border rounded-lg ${fieldErrors.email ? "border-red-400" : "border-slate-200"}`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </Field>

            <Field label="Passport Number">
              <input
                name="passport_number"
                placeholder="e.g. P1234567"
                value={formData.passport_number}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </Field>

            <Field label="Preferred Country">
              <FilterDropdown
                value={formData.preferred_country}
                onChange={(val) => handleFieldChange("preferred_country", val)}
                options={countryOptions}
                allLabel="Select Country"
              />
            </Field>
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-2 gap-2">
            <Field label="Test Score">
              <input
                type="number"
                name="test_score"
                placeholder="e.g. 7.5"
                value={formData.test_score}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </Field>

            <Field label="Budget">
              <input
                type="number"
                name="budget"
                placeholder="e.g. 500000"
                value={formData.budget}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </Field>
          </div>

          {/* ROW 3b — Intake & Year */}
          <div className="grid grid-cols-2 gap-2">
            <Field label="Intake">
              <FilterDropdown
                value={formData.intake}
                onChange={(val) => handleFieldChange("intake", val)}
                options={intakeOptions}
                allLabel="Select Intake"
              />
            </Field>

            <Field label="Year">
              <YearPicker
                value={formData.year}
                onChange={(year) => handleFieldChange("year", year)}
              />
            </Field>
          </div>

          {/* ROW 4 */}
          <div className="grid grid-cols-3 gap-2">
            <Field label="Parent Name">
              <input
                name="parent_name"
                placeholder="e.g. Mary Mathew"
                value={formData.parent_name}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </Field>

            <Field label="Academic Details">
              <input
                name="academic_details"
                placeholder="e.g. B.Sc Computer Science"
                value={formData.academic_details}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </Field>

            <Field label="Work Experience">
              <input
                name="work_experience"
                placeholder="e.g. 2 years"
                value={formData.work_experience}
                onChange={handleChange}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              />
            </Field>
          </div>

          {/* ADDRESS */}
          <Field label="Address">
            <textarea
              name="address"
              placeholder="Full address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none"
            />
          </Field>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">

            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm btn-primary text-white rounded-lg hover:btn-primary-hover disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Student"}
            </button>

          </div>

    </form>
  );
}