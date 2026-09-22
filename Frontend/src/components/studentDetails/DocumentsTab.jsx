
import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
} from "../../services/studentDetailsApi";

export default function DocumentsTab({ studentId, setToast }) {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getStudentDocuments(studentId);
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [studentId]);

  const handleClearFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return;

    try {
      setUploading(true);

      await uploadStudentDocument(studentId, file, documentType);

      setFile(null);
      setDocumentType("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchDocuments();

      setToast({
        type: "success",
        message: "Document uploaded successfully.",
      });
    } catch (error) {
      console.error("Document upload failed:", error);

      setToast({
        type: "error",
        message: "Failed to upload document.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      await deleteStudentDocument(documentId);

      await fetchDocuments();

      setToast({
        type: "success",
        message: "Document deleted.",
      });
    } catch (error) {
      console.error("Document delete failed:", error);

      setToast({
        type: "error",
        message: "Failed to delete document.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleUpload}
        className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl p-3"
      >
        {/* File Selection */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
            Choose File

            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="hidden"
            />
          </label>

          {file ? (
            <span className="flex items-center gap-1.5 text-sm text-slate-600 truncate">
              {file.name}

              <button
                type="button"
                onClick={handleClearFile}
                title="Remove selected file"
                className="text-slate-400 hover:text-danger transition-colors"
              >
                <X size={13} />
              </button>
            </span>
          ) : (
            <span className="text-sm text-slate-400">
              No file chosen
            </span>
          )}
        </div>

        {/* Document Type */}
        <input
          type="text"
          placeholder="Document type (e.g. Passport)"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm flex-1 min-w-[160px]"
        />

        {/* Upload Button */}
        <button
          type="submit"
          disabled={!file || uploading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Upload size={14} />

          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {/* Documents List */}
      {loading ? (
        <p className="text-sm text-slate-400">
          Loading documents...
        </p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-slate-400">
          No documents uploaded yet.
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-slate-50 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <FileText size={16} />
                </div>

                <div>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    {doc.document_type || "Document"}
                  </a>

                  <p className="text-xs text-slate-400">
                    Uploaded by {doc.uploaded_by_name || "Unknown"} ·{" "}
                    {new Date(doc.uploaded_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Delete only by uploader */}
              {user?.id === doc.uploaded_by && (
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  title="Delete"
                  className="p-2 rounded-lg bg-red-50 text-danger hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


