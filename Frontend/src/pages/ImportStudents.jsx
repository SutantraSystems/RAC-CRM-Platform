import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { uploadStudentsExcel } from "../services/studentApi";

export default function ImportStudents() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleFile = (selectedFiles) => {
    
  
    setFiles(Array.from(selectedFiles));
    setResult(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    try {
      const res = await uploadStudentsExcel(files);
      setResult(res.data);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Upload failed",
      );
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
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

        {/* UPLOAD AREA */}
        <div
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-500 transition"
        >
          <FileSpreadsheet size={60} className="mx-auto text-green-600 mb-4" />

          <h3>
            {files.length > 0
              ? `${files.length} files selected`
              : "Click or Drop Excel Files Here"}
          </h3>

          {files.length > 0 && (
            <ul className="mt-3 text-sm text-slate-600">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}

          <p className="text-slate-500 mt-2">Supported formats: .xlsx, .csv</p>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            hidden
            multiple
            onChange={(e) => handleFile(e.target.files)}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
            disabled={files.length === 0 || loading}
            className="mt-6 px-5 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Import Result
          </h2>

          <div className="space-y-2 text-slate-600">
            <p>Total Rows: {result.total_rows}</p>
            <p className="text-green-600">Inserted: {result.inserted}</p>
            <p className="text-blue-600">Updated: {result.updated}</p>

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
