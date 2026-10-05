import React, { useState, useEffect } from "react";
import { Check, FileText, Eye } from "lucide-react";
import FilterDropdown from "../ui/FilterDropdown";

// import { getStudentDocuments } from "../../services/studentDetailsApi";

import {
  STATUS_OPTIONS,
  STAGE_VALUES,
  getStatusLabel,
} from "../../data/students";

const Row = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4 px-4 sm:px-5 py-3">
    <p className="text-sm text-slate-600 font-medium sm:w-36 sm:shrink-0">
      {label}
    </p>

    <p className="min-w-0 text-sm font-semibold text-slate-800 break-words">
      {value || "—"}
    </p>
  </div>
);

const Section = ({
  title,
  children,
  padded = false,
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl shadow-md border border-slate-300 overflow-hidden ${className}`}
  >
    <div className="px-4 sm:px-5 py-3 border-b border-slate-300 bg-slate-100">
      <h3 className="font-display font-semibold text-slate-800 text-sm">
        {title}
      </h3>
    </div>

    <div
      className={
        padded
          ? "p-4 sm:p-5"
          : "divide-y divide-slate-200"
      }
    >
      {children}
    </div>
  </div>
);

/*
const getFileName = (url) => {
  if (!url) return "Document";

  try {
    return decodeURIComponent(
      url.split("?")[0].split("/").pop()
    );
  } catch {
    return "Document";
  }
};
*/

const getAllowedStatusOptions = (status) => {
  const currentIndex = STAGE_VALUES.indexOf(status);
  const enabled = currentIndex !== -1;

  return STATUS_OPTIONS.filter((opt) => {
    if (opt.value === "not_interested" || opt.value === "not_sure") {
      return true;
    }

    const stageIndex = STAGE_VALUES.indexOf(opt.value);
    if (stageIndex === -1) return false;

    if (!enabled) {
      // Not currently in the pipeline — only the first stage can start it.
      return stageIndex === 0;
    }

    return stageIndex === currentIndex || stageIndex === currentIndex + 1;
  });
};

// Application progress
const StageTracker = ({
  status,
  onStatusChange,
}) => {
  const currentIndex =
    STAGE_VALUES.indexOf(status);

  const enabled = currentIndex !== -1;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-300 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-5 sm:mb-6">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-slate-800 text-sm">
            Application Progress
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {enabled
              ? "Complete each step in order to move forward."
              : `Status is ${getStatusLabel(
                  status
                )}. Set it to Interested to start tracking progress.`}
          </p>
        </div>

        <div className="w-full sm:w-44 sm:shrink-0">
          <FilterDropdown
            value={status}
            onChange={onStatusChange}
            options={getAllowedStatusOptions(status)}
            showAllOption={false}
          />
        </div>
      </div>

      <div className="overflow-x-auto overscroll-x-contain px-1 pt-1 pb-2 -mx-1">
        <div className="flex min-w-[520px] sm:min-w-0">
          {STAGE_VALUES.map((value, i) => {
            const done =
              enabled && i < currentIndex;

            const current =
              enabled && i === currentIndex;

            const lineActive =
              enabled && i <= currentIndex;

            // Only the current step and the very next one are clickable —
            // you can revisit/undo back to the current step, or advance
            // exactly one step at a time. No skipping ahead.
            const clickable =
              enabled && (i === currentIndex || i === currentIndex + 1);

            const dot = !enabled
              ? "bg-slate-100 border-slate-300 text-slate-400"
              : done
              ? "bg-green-500 border-green-500 text-white"
              : current
              ? "bg-primary-600 border-primary-600 text-white ring-4 ring-primary-200"
              : clickable
              ? "bg-white border-primary-300 text-primary-500 group-hover:border-primary-400"
              : "bg-white border-slate-200 text-slate-300";

            return (
              <button
                key={value}
                type="button"
                disabled={!clickable}
                onClick={() =>
                  clickable &&
                  value !== status &&
                  onStatusChange(value)
                }
                title={
                  !enabled
                    ? undefined
                    : clickable
                    ? undefined
                    : "Complete the previous steps first"
                }
                className={`group relative flex-1 flex flex-col items-center px-1 ${
                  clickable
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
                }`}
              >
                {i > 0 && (
                  <span
                    className={`absolute top-4 -left-1/2 w-full h-0.5 ${
                      lineActive
                        ? "bg-green-500"
                        : "bg-slate-200"
                    }`}
                  />
                )}

                <span
                  className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors ${dot}`}
                >
                  {done ? (
                    <Check size={14} />
                  ) : (
                    i + 1
                  )}
                </span>

                <span
                  className={`mt-2 text-xs text-center leading-tight ${
                    !enabled || !clickable
                      ? "text-slate-400"
                      : current
                      ? "font-semibold text-slate-800"
                      : "text-slate-600"
                  }`}
                >
                  {getStatusLabel(value)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function OverviewTab({
  student,
  onStatusChange,
}) {
  /*
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setDocsLoading(true);

        const response =
          await getStudentDocuments(student.id);

        setDocuments(response.data);
      } catch (error) {
        console.error(
          "Failed to load documents:",
          error
        );
      } finally {
        setDocsLoading(false);
      }
    };

    fetchDocuments();
  }, [student.id]);
  */

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Application Progress */}
      <StageTracker
        status={student.status || "not_sure"}
        onStatusChange={onStatusChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
        {/* Personal Information */}
        <Section title="Personal Information">
          <Row
            label="Full Name"
            value={student.full_name}
          />

          <Row
            label="Date of Birth"
            value={student.dob}
          />

          <Row
            label="Mobile Number"
            value={student.mobile_number}
          />

          <Row
            label="Email"
            value={student.email}
          />

          <Row
            label="Passport Number"
            value={student.passport_number}
          />

          <Row
            label="Address"
            value={student.address}
          />

          <Row
            label="Parent Name"
            value={student.parent_name}
          />

          <Row
            label="Location"
            value={student.location}
          />
        </Section>

        {/* Academic / Application Information */}
        <Section title="Academic / Application Information">
          <Row
            label="Academic Details"
            value={student.academic_details}
          />

          <Row
            label="Test Score"
            value={student.test_score}
          />

          <Row
            label="Preferred Country"
            value={student.preferred_country}
          />

          <Row
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

          <Row
            label="Intake Year"
            value={student.year}
          />

          <Row
            label="Budget"
            value={student.budget}
          />

          <Row
            label="Work Experience"
            value={student.work_experience}
          />

          <Row
            label="Source File"
            value={student.source_file || "Manually Added"}
          />
        </Section>

        {/*

        <Section
          title={`Documents${
            documents.length
              ? ` (${documents.length})`
              : ""
          }`}
          padded
          className="lg:col-span-2"
        >
          {docsLoading ? (
            <p className="text-sm text-slate-500">
              Loading documents...
            </p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-slate-500">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file}
                  target="_blank"
                  rel="noreferrer"
                  title={getFileName(doc.file)}
                  className="group flex flex-col gap-3 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-xl p-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary-600">
                      <FileText size={16} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {doc.document_type || "Document"}
                      </p>

                      <p className="text-xs text-slate-500 truncate">
                        {getFileName(doc.file)}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-xs font-medium text-primary-600 group-hover:text-primary-700">
                    <Eye size={13} />
                    View
                  </span>
                </a>
              ))}
            </div>
          )}
        </Section>

        */}
      </div>
    </div>
  );
}