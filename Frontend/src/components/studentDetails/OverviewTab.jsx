import React from "react";

const Row = ({ label, value }) => (
  <div className="flex items-start gap-4 px-5 py-3">
    <p className="text-sm text-slate-600 font-medium w-36 shrink-0">
      {label}
    </p>

    <p className="text-sm font-semibold text-slate-800 break-words">
      {value || "—"}
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-300 overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-300 bg-slate-100">
      <h3 className="font-display font-semibold text-slate-800 text-sm">
        {title}
      </h3>
    </div>

    <div className="divide-y divide-slate-200">
      {children}
    </div>
  </div>
);

export default function OverviewTab({ student }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
      
      <Section title="Personal Information">
        <Row label="Full Name" value={student.full_name} />
        <Row label="Date of Birth" value={student.dob} />
        <Row label="Mobile Number" value={student.mobile_number} />
        <Row label="Email" value={student.email} />
        <Row label="Passport Number" value={student.passport_number} />
        <Row label="Address" value={student.address} />
        <Row label="Parent Name" value={student.parent_name} />
      </Section>

      <Section title="Academic / Application Information">
        <Row label="Academic Details" value={student.academic_details} />
        <Row label="Test Score" value={student.test_score} />
        <Row label="Preferred Country" value={student.preferred_country} />
        <Row label="Intake Date" value={student.intake_date} />
        <Row label="Budget" value={student.budget} />
        <Row label="Work Experience" value={student.work_experience} />
      </Section>

    </div>
  );
}

