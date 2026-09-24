import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { uploadStudentsExcel } from "../services/studentApi";
import Toast from "../components/ui/Toast";

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

    try {
      const res = await uploadStudentsExcel(files);

      setResult(res.data);

      setToast({
        type: "success",
        message: "Students imported successfully!",
      });
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

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <Upload size={24} className="text-primary-600" />

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Import Students
            </h1>

            <p className="text-slate-500">
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
            p-10
            text-center
            bg-slate-50/50
          "
        >
          <FileSpreadsheet
            size={60}
            className="mx-auto text-green-600 mb-4"
          />

          <h3 className="text-sm text-slate-500 mt-2">
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
                    px-4
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
                      <p className="text-sm font-medium text-slate-700 truncate">
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
            <div className="flex justify-end mt-5">
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
                  items-center
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
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Import Result
          </h2>

          <div className="space-y-2 text-slate-600">
            <p>Total Rows: {result.total_rows}</p>

            <p className="text-green-600">
              Inserted: {result.inserted}
            </p>

            {result.skipped_duplicates > 0 && (
              <div className="text-amber-600">
                <p>Skipped (already exists): {result.skipped_duplicates}</p>
                {result.duplicate_rows?.length > 0 && (
                  <ul className="list-disc ml-5 text-sm">
                    {result.duplicate_rows.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* <p className="text-blue-600">
              Updated: {result.updated}
            </p> */}

            {result.errors?.length > 0 && (
              <div className="text-red-500 mt-3">
                <p>Errors:</p>

                <ul className="list-disc ml-5">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}