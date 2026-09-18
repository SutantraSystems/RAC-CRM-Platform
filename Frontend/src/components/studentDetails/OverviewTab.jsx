import React from "react";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-sm font-medium text-slate-700 mt-0.5">{value || "-"}</p>
  </div>
);

export default function OverviewTab({ student }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Full Name" value={student.full_name} />
          <Field label="Date of Birth" value={student.dob} />
          <Field label="Mobile Number" value={student.mobile_number} />
          <Field label="Email" value={student.email} />
          <Field label="Passport Number" value={student.passport_number} />
          <Field label="Address" value={student.address} />
          <Field label="Parent Name" value={student.parent_name} />
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">
          Academic / Application Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Academic Details" value={student.academic_details} />
          <Field label="Test Score" value={student.test_score} />
          <Field label="Preferred Country" value={student.preferred_country} />
          <Field label="Intake Date" value={student.intake_date} />
          <Field label="Budget" value={student.budget} />
          <Field label="Work Experience" value={student.work_experience} />
        </div>
      </div>
    </div>
  );
}