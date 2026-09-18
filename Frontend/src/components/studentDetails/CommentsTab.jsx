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

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await deleteStudentComment(commentId);
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setToast({ type: "error", message: "Failed to delete comment." });
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
    </div>
  );
}