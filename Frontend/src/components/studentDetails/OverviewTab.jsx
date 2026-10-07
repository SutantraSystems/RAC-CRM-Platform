import React from "react";
import {
  Check,
  FileText,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ListChecks,
  Send,
  CreditCard,
  BadgeCheck,
  CalendarClock,
  UserCheck,
  PhoneMissed,
  PhoneOff,
  User,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Contact,
  GraduationCap,
  Globe2,
  CalendarRange,
  WalletCards,
  BriefcaseBusiness,
  FolderOpen,
} from "lucide-react";

import FilterDropdown from "../ui/FilterDropdown";
import { STATUS_OPTIONS } from "../../data/students";

const STATUS_ICONS = {
  not_interested: ThumbsDown,
  interested: ThumbsUp,
  not_sure: HelpCircle,
  shortlisting_done: ListChecks,
  docs_shared: FileText,
  applied: Send,
  deposit_paid: CreditCard,
  visa_granted: BadgeCheck,
  future_intake: CalendarClock,
  prm_prospect: UserCheck,
  no_response: PhoneMissed,
  invalid_number: PhoneOff,
};

const FIELD_ICONS = {
  "Full Name": User,
  "Date of Birth": CalendarDays,
  "Mobile Number": Phone,
  Email: Mail,
  "Passport Number": Contact,
  Address: MapPin,
  "Parent Name": User,
  Location: MapPin,
  "Academic Details": GraduationCap,
  "Test Score": BadgeCheck,
  "Preferred Country": Globe2,
  Intake: CalendarRange,
  "Intake Year": CalendarDays,
  Budget: WalletCards,
  "Work Experience": BriefcaseBusiness,
  "Source File": FolderOpen,
};

const InfoRow = ({ label, value }) => {
  const Icon = FIELD_ICONS[label] || User;

  return (
    <div className="group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-slate-50 sm:px-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
        <Icon size={16} strokeWidth={1.8} />
      </div>

      <p className="w-28 shrink-0 text-sm font-medium text-slate-500 sm:w-36">
        {label}
      </p>

      <p className="min-w-0 flex-1 break-words text-base font-semibold leading-snug text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
};

const InfoSection = ({ title, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-slate-50/80 px-3 py-2.5 sm:px-4">
      <h3 className="text-base font-semibold text-slate-800">
        {title}
      </h3>
    </div>

    <div className="divide-y divide-slate-100">
      {children}
    </div>
  </section>
);

// No overflow-hidden here, it would clip the dropdown menu
const StatusCards = ({ status, onStatusChange }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <ListChecks size={18} />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Application Status
          </h3>

          <p className="text-xs leading-tight text-slate-500">
            Select any status to update the application.
          </p>
        </div>
      </div>

      <div className="w-full sm:w-48 sm:shrink-0">
        <FilterDropdown
          value={status}
          onChange={onStatusChange}
          options={STATUS_OPTIONS}
          showAllOption={false}
        />
      </div>
    </div>

    <div className="p-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {STATUS_OPTIONS.map((option) => {
          const Icon = STATUS_ICONS[option.value] || HelpCircle;
          const selected = option.value === status;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (!selected) {
                  onStatusChange(option.value);
                }
              }}
              className={`group flex min-w-0 items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-200 ${
                selected
                  ? "border-green-400 bg-green-50 ring-1 ring-green-200"
                  : "border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/40"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  selected
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600"
                }`}
              >
                <Icon size={16} />
              </span>

              <span
                className={`min-w-0 flex-1 break-words text-sm font-semibold leading-tight ${
                  selected ? "text-green-800" : "text-slate-700"
                }`}
              >
                {option.label}
              </span>

              {selected && (
                <Check size={16} strokeWidth={3} className="shrink-0 text-green-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

export default function OverviewTab({
  student,
  onStatusChange,
}) {
  const currentStatus = student.status || "not_sure";

  return (
    <div className="space-y-3 sm:space-y-4">
      <StatusCards
        status={currentStatus}
        onStatusChange={onStatusChange}
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <InfoSection title="Personal Information">
          <InfoRow
            label="Full Name"
            value={student.full_name}
          />

          <InfoRow
            label="Date of Birth"
            value={student.dob}
          />

          <InfoRow
            label="Mobile Number"
            value={student.mobile_number}
          />

          <InfoRow
            label="Email"
            value={student.email}
          />

          <InfoRow
            label="Passport Number"
            value={student.passport_number}
          />

          <InfoRow
            label="Address"
            value={student.address}
          />

          <InfoRow
            label="Parent Name"
            value={student.parent_name}
          />
        </InfoSection>

        <InfoSection title="Academic / Application Information">
          <InfoRow
            label="Academic Details"
            value={student.academic_details}
          />

          <InfoRow
            label="Test Score"
            value={student.test_score}
          />

          <InfoRow
            label="Preferred Country"
            value={student.preferred_country}
          />

          <InfoRow
            label="Intake"
            value={
              student.intake === "fall"
                ? "Fall"
                : student.intake === "winter"
                ? "Winter"
                : student.intake === "spring"
                ? "Spring"
                : "Not Sure"
            }
          />

          <InfoRow
            label="Intake Year"
            value={student.year}
          />

          <InfoRow
            label="Budget"
            value={student.budget}
          />

          <InfoRow
            label="Work Experience"
            value={student.work_experience}
          />

          <InfoRow
            label="Source File"
            value={student.source_file || "Manually Added"}
          />
        </InfoSection>
      </div>
    </div>
  );
}