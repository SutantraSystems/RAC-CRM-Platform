import React, { useState } from "react";

export default function StudentForm({
  initialData = {},
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || null,
    dob: initialData.dob || null,
    mobile_number: initialData.mobile_number || null,
    email: initialData.email || null,
    passport_number: initialData.passport_number || null,
    academic_details: initialData.academic_details || null,
    test_score: initialData.test_score || null,
    preferred_country: initialData.preferred_country || null,
    intake_date: initialData.intake_date || null,
    budget: initialData.budget || null,
    work_experience: initialData.work_experience || null,
    address: initialData.address || null,
    parent_name: initialData.parent_name || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {};

  Object.keys(formData).forEach((key) => {
    payload[key] =
      formData[key] === ""
        ? null
        : formData[key];
  });

  onSubmit(payload);
};

  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      <h2 className="text-xl font-semibold mb-6 text-slate-800">
        {initialData.id ? "Edit Student" : "Add New Student"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile Number
          </label>
          <input
            type="text"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            className="input-field w-full"
            
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Passport */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Passport Number
          </label>
          <input
            type="text"
            name="passport_number"
            value={formData.passport_number}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Preferred Country */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Preferred Country
          </label>
          <input
            type="text"
            name="preferred_country"
            value={formData.preferred_country}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Test Score */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Test Score
          </label>
          <input
            type="number"
            step="0.01"
            name="test_score"
            value={formData.test_score}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Intake Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Intake Date
          </label>
          <input
            type="date"
            name="intake_date"
            value={formData.intake_date}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Budget
          </label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Parent Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Parent Name
          </label>
          <input
            type="text"
            name="parent_name"
            value={formData.parent_name}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Academic Details */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Academic Details
          </label>
          <textarea
            rows="3"
            name="academic_details"
            value={formData.academic_details}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Work Experience */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Work Experience
          </label>
          <textarea
            rows="3"
            name="work_experience"
            value={formData.work_experience}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Address
          </label>
          <textarea
            rows="3"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input-field w-full"
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:opacity-90"
          >
            Save Student
          </button>
        </div>
      </form>
    </div>
  );
}