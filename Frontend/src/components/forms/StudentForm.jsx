import React, { useState } from "react";

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
  intake_date: initialData.intake_date || "",
  budget: initialData.budget ?? "",
  work_experience: initialData.work_experience || "",
  address: initialData.address || "",
  parent_name: initialData.parent_name || "",
});
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {};

  Object.keys(formData).forEach((key) => {
    let value = formData[key];

    if (value === "") {
      value = null;
    }

    if (
      value !== null &&
      (key === "test_score" || key === "budget")
    ) {
      value = Number(value);
    }

    payload[key] = value;
  });

  console.log("Payload:", payload);

  onSubmit(payload);
};

  return (
    //  MODAL WRAPPER
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">

      {/* MODAL BOX */}
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl border border-slate-200">

        {/* HEADER */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <h2 className="text-base font-semibold text-slate-800">
            {initialData.id ? "Edit Student" : "Add Student"}
          </h2>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">

          {/* ROW 1 */}
          <div className="grid grid-cols-3 gap-2">
            <input
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <input
              name="mobile_number"
              placeholder="Mobile"
              value={formData.mobile_number}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-3 gap-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
              
            />

            <input
              name="passport_number"
              placeholder="Passport"
              value={formData.passport_number}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <input
              name="preferred_country"
              placeholder="Country"
              value={formData.preferred_country}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          {/* ROW 3 */}
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              name="test_score"
              placeholder="Score"
              value={formData.test_score}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <input
              type="date"
              name="intake_date"
              value={formData.intake_date}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <input
              type="number"
              name="budget"
              placeholder="Budget"
              value={formData.budget}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          {/* ROW 4 */}
          <div className="grid grid-cols-3 gap-2">
            <input
              name="parent_name"
              placeholder="Parent"
              value={formData.parent_name}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <input
              name="academic_details"
              placeholder="Academic"
              value={formData.academic_details}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />

            <input
              name="work_experience"
              placeholder="Experience"
              value={formData.work_experience}
              onChange={handleChange}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>

          {/* ADDRESS */}
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none"
          />

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
              className="px-4 py-2 text-sm btn-primary text-white rounded-lg hover:btn-primary-hover"
            >
              Save Student
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}