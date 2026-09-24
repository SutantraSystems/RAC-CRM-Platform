import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getStudentComments,
  addStudentComment,
  deleteStudentComment,
} from "../../services/studentDetailsApi";

export default function CommentsTab({ studentId, setToast }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getStudentComments(studentId);
      setComments(response.data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [studentId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setSubmitting(true);
      await addStudentComment(studentId, text.trim());
      setText("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
      setToast({ type: "error", message: "Failed to add comment." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (commentId) => setDeleteTarget(commentId);

  const handleConfirmDelete = async () => {
    setDeleting(true);

    try {
      await deleteStudentComment(deleteTarget);
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setToast({ type: "error", message: "Failed to delete comment." });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddComment} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Add Comment"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {c.user_name || "Unknown"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>

                {user?.id === c.user && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-danger transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap">
                {c.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3
                className="text-base font-semibold text-slate-800"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Delete Comment?
              </h3>

              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Trash2 size={18} className="text-danger" />
                </div>

                <p className="text-sm font-medium text-slate-700">
                  Are you sure you want to delete this comment?
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="btn-outline rounded-xl px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Comment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}