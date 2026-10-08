import React, { useState } from "react";
import { GraduationCap, Phone, Mail, Building2, Briefcase } from "lucide-react";
import FormField, { TextInput, FormSection, FormFooter } from "../common/FormField";
import { cleanPayload } from "../../config/crmConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildInitial = (data) => ({
  name: data.name || "",
  phone_number: data.phone_number || "",
  email: data.email || "",
  organisation_name: data.organisation_name || "",
  designation: data.designation || "",
});

export default function UniversityForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => buildInitial(initialData));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    // onSubmit resolves to { field: "message" } when the server rejects it.
    const serverErrors = await onSubmit(cleanPayload(formData));
    setSaving(false);
    setFieldErrors(serverErrors || {});
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <FormSection id="university" title="University Details">
        <FormField label="Name" htmlFor="name" required error={fieldErrors.name} className="sm:col-span-2">
          <TextInput
            id="name"
            name="name"
            icon={<GraduationCap size={16} />}
            placeholder="e.g. University of Toronto"
            value={formData.name}
            onChange={handleChange}
            autoFocus
            error={fieldErrors.name}
          />
        </FormField>

        <FormField label="Phone Number" htmlFor="phone_number" error={fieldErrors.phone_number}>
          <TextInput
            id="phone_number"
            name="phone_number"
            inputMode="tel"
            icon={<Phone size={16} />}
            placeholder="e.g. 9876543210"
            value={formData.phone_number}
            onChange={handleChange}
            error={fieldErrors.phone_number}
          />
        </FormField>

        <FormField label="Email Address" htmlFor="email" error={fieldErrors.email}>
          <TextInput
            id="email"
            type="email"
            name="email"
            icon={<Mail size={16} />}
            placeholder="e.g. admissions@university.edu"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />
        </FormField>

        <FormField label="Organisation Name" htmlFor="organisation_name" error={fieldErrors.organisation_name}>
          <TextInput
            id="organisation_name"
            name="organisation_name"
            icon={<Building2 size={16} />}
            placeholder="e.g. ABC Education Partners"
            value={formData.organisation_name}
            onChange={handleChange}
            error={fieldErrors.organisation_name}
          />
        </FormField>

        <FormField label="Designation" htmlFor="designation" error={fieldErrors.designation}>
          <TextInput
            id="designation"
            name="designation"
            icon={<Briefcase size={16} />}
            placeholder="e.g. Admissions Officer"
            value={formData.designation}
            onChange={handleChange}
            error={fieldErrors.designation}
          />
        </FormField>
      </FormSection>

      <FormFooter
        onCancel={onCancel}
        saving={saving}
        submitLabel={initialData?.id ? "Save Changes" : "Add University"}
      />
    </form>
  );
}