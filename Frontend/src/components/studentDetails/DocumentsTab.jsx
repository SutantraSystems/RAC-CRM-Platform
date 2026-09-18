import React, { useState, useEffect } from "react";
import { Upload, FileText, Trash2 } from "lucide-react";
import {
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
} from "../../services/studentDetailsApi";

export default function DocumentsTab({ studentId, setToast }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      await uploadStudentDocument(studentId, file, documentType);
      setFile(null);
      setDocumentType("");
      await fetchDocuments();
      setToast({ type: "success", message: "Document uploaded successfully." });
    } catch (error) {
      console.error("Document upload failed:", error);
      setToast({ type: "error", message: "Failed to upload document." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      await deleteStudentDocument(documentId);
      await fetchDocuments();
      setToast({ type: "success", message: "Document deleted." });
    } catch (error) {
      console.error("Document delete failed:", error);
      setToast({ type: "error", message: "Failed to delete document." });
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleUpload}
        className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl p-3"
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm"
        />
        <input
          type="text"
          placeholder="Document type (e.g. Passport)"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm flex-1 min-w-[160px]"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-slate-400">No documents uploaded yet.</p>
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

              <button
                onClick={() => handleDelete(doc.id)}
                title="Delete"
                className="p-2 rounded-lg bg-red-50 text-danger hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}