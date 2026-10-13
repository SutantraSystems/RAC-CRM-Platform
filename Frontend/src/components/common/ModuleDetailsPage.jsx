import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FormModal from "./FormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { getErrorMessage, getFieldErrors } from "../../config/crmConfig";
import RecordActions from "./RecordActions";
import useToast from "../../hooks/useToast";

const TABS = ["Overview"];
export default function ModuleDetailsPage({
  api,
  basePath,
  singular,
  plural,
  getTitle,
  getName,
  renderOverview,
  FormComponent,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // The list URL (with ?page=&filters) this page was opened from.
  const fromList =
    typeof location.state?.from === "string" && location.state.from.startsWith(basePath)
      ? location.state.from
      : basePath;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setToast, toastElement } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(id);
        setItem(response.data);
      } catch (err) {
        console.error(`Failed to load ${singular}:`, err);
        setError(`Could not load this ${singular.toLowerCase()}. It may have been deleted.`);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveEdit = async (formData) => {
    try {
      const response = await api.update(item.id, formData);
      setItem(response.data);
      setShowEdit(false);
      setToast({ type: "success", message: `${singular} updated successfully!` });
    } catch (err) {
      console.error("Save failed:", err);
      const data = err.response?.data;
      setToast({
        type: "error",
        message: getErrorMessage(
          data,
          `Failed to save ${singular.toLowerCase()}. Please check the form and try again.`
        ),
      });
      return getFieldErrors(data);
    }
  };

  const handlePatch = async (changes, successMessage) => {
    const previous = {};
    Object.keys(changes).forEach((key) => {
      previous[key] = item[key];
    });

    setItem((prev) => ({ ...prev, ...changes }));

    try {
      await api.patch(item.id, changes);
      if (successMessage) setToast({ type: "success", message: successMessage });
    } catch (err) {
      console.error("Quick update failed:", err);
      setItem((prev) => ({ ...prev, ...previous }));
      setToast({ type: "error", message: "Failed to update. Please try again." });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await api.remove(item.id);
      navigate(fromList);
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({
        type: "error",
        message: `Failed to delete ${singular.toLowerCase()}. Please try again.`,
      });
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400">Loading {singular.toLowerCase()}...</div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">{error || `${singular} not found.`}</p>
        <button onClick={() => navigate(fromList)} className="btn-outline">
          Back to {plural}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {toastElement}

      <button
        onClick={() => navigate(fromList)}
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={15} />
        Back to {plural}
      </button>

      <div className="pt-2 pb-1 min-w-0">
        <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-slate-800 tracking-tight break-words">
          {getTitle(item)}
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-card min-w-0">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 sm:px-4">
          <div className="flex min-w-0 overflow-x-auto overscroll-x-contain">
            {TABS.map((tab) => (
              <button
                key={tab}
                className="shrink-0 whitespace-nowrap px-3 sm:px-4 py-3 text-sm font-semibold border-b-2 border-primary-600 text-primary-600"
              >
                {tab}
              </button>
            ))}
          </div>

          <RecordActions
            singular={singular}
            onEdit={() => setShowEdit(true)}
            onDelete={() => setShowDelete(true)}
          />
        </div>

        <div className="p-3 sm:p-5">{renderOverview({ item, onPatch: handlePatch })}</div>
      </div>

      {showEdit && (
        <FormModal title={`Edit ${singular}`} onClose={() => setShowEdit(false)}>
          <FormComponent
            initialData={item}
            onSubmit={handleSaveEdit}
            onCancel={() => setShowEdit(false)}
          />
        </FormModal>
      )}

      <ConfirmDeleteModal
        open={showDelete}
        title={`Delete ${singular}?`}
        message={`Are you sure you want to delete ${getName(item)}?`}
        confirmLabel={`Delete ${singular}`}
        loading={deleting}
        onCancel={() => !deleting && setShowDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}