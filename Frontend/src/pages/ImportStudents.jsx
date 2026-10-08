import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ListChecks,
} from "lucide-react";
import { uploadStudentsExcel } from "../services/studentApi";
import Toast from "../components/ui/Toast";

const ResultStat = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    slate: "bg-slate-50 border-slate-200 text-slate-700",
    green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className={`rounded-xl border p-3 flex items-center gap-3 min-w-0 ${tones[tone]}`}>
      <Icon size={20} className="shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-80 break-words">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
};

const DetailList = ({ title, items, icon: Icon, tone }) => {
  if (!items || items.length === 0) return null;

  const tones = {
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    red: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <div className={`rounded-xl border p-3 sm:p-4 min-w-0 ${tones[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="shrink-0" />
        <p className="text-sm font-semibold">
          {title} ({items.length})
        </p>
      </div>

      <ul className="list-disc ml-5 text-sm space-y-1 max-h-72 overflow-y-auto pr-2">
        {items.map((item, i) => (
          <li key={i} className="break-words">{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default function ImportStudents() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const inputRef = useRef();

  const handleFile = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setFiles(Array.from(selectedFiles));
    setResult(null);
  };

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, fileIndex) => fileIndex !== index)
    );

    setResult(null);

    // Allow selecting the same file again after removing it
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setResult(null);
    setToast({ type: "info", message: "Upload started..." });

    try {
      const res = await uploadStudentsExcel(files);
      const data = res.data;

      setResult(data);

      if (!data.success) {
        setToast({
          type: "error",
          message: data.error || "Upload failed.",
        });
      } else if (data.inserted === 0) {
        setToast({
          type: "warning",
          message:
            "Upload finished, but no students were added — check the results below.",
        });
      } else {
        setToast({
          type: "success",
          message: `Upload successful — ${data.inserted} student${data.inserted === 1 ? "" : "s"
            } imported.`,
        });
      }
    } catch (err) {
      console.error(err);

      setToast({
        type: "error",
        message:
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Upload failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const missingFieldErrors =
    result?.errors?.filter((e) => e.includes("is required")) || [];
  const otherErrors =
    result?.errors?.filter((e) => !e.includes("is required")) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <Upload size={24} className="text-primary-600 shrink-0" />

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Import Students
            </h1>

            <p className="text-sm sm:text-base text-slate-500">
              Upload Excel files to bulk import student records.
            </p>
          </div>
        </div>

        {/* UPLOAD AREA - NOT CLICKABLE */}
        <div
          className="
            border-2
            border-dashed
            border-slate-300
            rounded-xl
            p-5
            sm:p-10
            text-center
            bg-slate-50/50
          "
        >
          <FileSpreadsheet
            size={60}
            className="mx-auto text-green-600 mb-3 sm:mb-4 w-12 h-12 sm:w-[60px] sm:h-[60px]"
          />

          <h3 className="text-sm text-slate-500 mt-2 break-words">
            Choose files from your computer to import student records.
          </h3>

          <p className="text-xs text-slate-400 mt-2">
            Supported formats: .xlsx
          </p>

          {/* Hidden Input */}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            hidden
            multiple
            onChange={(e) => handleFile(e.target.files)}
          />

          {/* CHOOSE FILE BUTTON */}
          <button
            type="button"
            onClick={handleChooseFile}
            disabled={loading}
            className="
              mt-5
              px-5
              py-2.5
              bg-primary-600
              text-white
              rounded-lg
              font-medium
              hover:bg-primary-700
              transition-colors
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Choose File
          </button>
        </div>

        {/* SELECTED FILES */}
        {files.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Selected Files
            </h3>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    px-3
                    sm:px-4
                    py-3
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                  "
                >
                  {/* FILE INFORMATION */}
                  <div className="flex items-center gap-3 min-w-0">
                    <FileSpreadsheet
                      size={20}
                      className="text-green-600 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate" title={file.name}>
                        {file.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  {/* REMOVE FILE */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={loading}
                    title="Remove file"
                    className="
                      w-8
                      h-8
                      flex
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      hover:text-red-500
                      hover:bg-red-50
                      transition-colors
                      shrink-0
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                    "
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>

            {/* UPLOAD BUTTON */}
            <div className="flex sm:justify-end mt-5">
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="
                  px-5
                  py-2.5
                  bg-primary-600
                  text-white
                  rounded-lg
                  font-medium
                  hover:bg-primary-700
                  transition-colors
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  flex
                  w-full
                  sm:w-auto
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Upload size={16} />

                {loading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* IMPORT RESULT */}
      {result && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            {result.inserted > 0 ? (
              <CheckCircle2 size={20} className="text-green-600" />
            ) : (
              <AlertTriangle size={20} className="text-amber-600" />
            )}
            <h2 className="text-lg font-semibold text-slate-800">
              Import Result
            </h2>
          </div>

          {/* One-line summary */}
          <div className="mb-4 sm:mb-5 space-y-1 text-sm sm:text-base font-semibold">
            <p className="text-green-700">
              ✓ {result.inserted} student{result.inserted === 1 ? "" : "s"} uploaded
            </p>
            {result.skipped_duplicates > 0 && (
              <p className="text-red-600">
                ✕ {result.skipped_duplicates} duplicate student
                {result.skipped_duplicates === 1 ? "" : "s"} rejected
              </p>
            )}
          </div>

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <ResultStat
              icon={ListChecks}
              label="Total Rows"
              value={result.total_rows}
              tone="slate"
            />
            <ResultStat
              icon={CheckCircle2}
              label="Inserted"
              value={result.inserted}
              tone="green"
            />
            <ResultStat
              icon={AlertTriangle}
              label="Duplicates Rejected"
              value={result.skipped_duplicates}
              tone="amber"
            />
            <ResultStat
              icon={XCircle}
              label="Failed Rows"
              value={result.failed ?? result.errors?.length ?? 0}
              tone="red"
            />
          </div>

          {/* Detailed, categorized breakdowns */}
          <div className="space-y-3">
            <DetailList
              title="Duplicate students rejected"
              items={result.duplicate_rows}
              icon={AlertTriangle}
              tone="red"
            />

            <DetailList
              title="Missing required fields"
              items={missingFieldErrors}
              icon={XCircle}
              tone="red"
            />

            <DetailList
              title="Invalid data"
              items={otherErrors}
              icon={XCircle}
              tone="red"
            />
          </div>

          {result.inserted === 0 &&
            result.skipped_duplicates === 0 &&
            (!result.errors || result.errors.length === 0) && (
              <p className="text-sm text-slate-500">
                No students were found in the uploaded file.
              </p>
            )}
        </div>
      )}
    </div>
  );
}