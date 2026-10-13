import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Trash2 } from "lucide-react";
import useListQuery from "../../hooks/useListQuery";
import useBulkSelection from "../../hooks/useBulkSelection";
import useSingleDelete from "../../hooks/useSingleDelete";
import ListFilters from "./ListFilters";
import DataTable from "./DataTable";
import FormModal from "./FormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { PAGE_SIZE, getErrorMessage, getFieldErrors } from "../../config/crmConfig";
import useToast from "../../hooks/useToast";


export default function ModuleListPage({
  api,              
  basePath,        
  title,            
  singular,         
  plural,           
  addLabel,         
  filterFields,     
  columns,          
  FormComponent,    // omit for a read-only list (no add / edit / delete)
  getName,          
  clearLabel,
  getRowPath,       // where a row click goes; defaults to `${basePath}/${row.id}`
  renderAboveTable, // optional block between the filters and the table (e.g. cards)
  rowActions,       // optional per-row action buttons, see DataTable
  refreshKey = 0,   // bump to reload the list after the parent changes data
  showTotal = true, // false hides the "N total records" line
  onDataChanged,    // optional; called after a delete so the parent can refresh (cards, bell)
  removeRecord,     // optional (row) => Promise; module-specific single delete, defaults to api.remove(row.id)
  deleteSuccessMessage, // optional text for the single-delete success toast
  getDeleteErrorMessage, // optional (error) => text for the single-delete error toast
}) {
  const canEdit = Boolean(FormComponent);
  const navigate = useNavigate();
  const location = useLocation();

  // Date-range fields own three URL keys (range + from + to).
  const filterKeys = useMemo(
    () => filterFields.flatMap((f) => [f.key, f.fromKey, f.toKey].filter(Boolean)),
    [filterFields]
  );
  const numericKeys = useMemo(
    () => filterFields.filter((f) => f.type === "year").map((f) => f.key),
    [filterFields]
  );

  const { page, filters, reloadKey, setPage, writeParams, applyFilters, clearFilters } =
    useListQuery(filterKeys, numericKeys);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { setToast, toastElement } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const requestId = useRef(0);

  // Row checkboxes + bulk delete appear when the api supports it (same behaviour as Students).
  const selectable = Boolean(api.bulkRemove);

  const buildParams = (pageNumber, filtersData) => {
    const params = { page: pageNumber, page_size: PAGE_SIZE };

    filterKeys.forEach((key) => {
      const value = filtersData[key];
      if (value !== "" && value !== null && value !== undefined && value !== "all") {
        params[key] = value;
      }
    });

    return params;
  };

  const fetchRows = async (pageNumber = 1, filtersData = {}) => {
    const current = ++requestId.current;
    let retrying = false;

    setLoading(true);

    try {
      const response = await api.list(buildParams(pageNumber, filtersData));
      if (current !== requestId.current) return;

      setRows(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      // Page in the URL no longer exists -> fall back to page 1.
      if (error.response?.status === 404 && pageNumber > 1) {
        retrying = true; // the page-1 refetch keeps the loading state on
        writeParams(1, filtersData);
        return;
      }
      console.error(`Error loading ${plural}:`, error);
      setToast({ type: "error", message: `Could not load ${plural.toLowerCase()}.` });
    } finally {
      // Ignore results of superseded requests; only the latest one ends loading.
      if (current === requestId.current && !retrying) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows(page, filters);
  }, [page, filters, reloadKey, refreshKey]);

  const {
    selectedIds,
    selectedCount,
    allMatchingSelected,
    selectingAll,
    showSelectAllMatching,
    showBulkConfirm,
    setShowBulkConfirm,
    bulkDeleting,
    toggleSelect,
    toggleSelectAll,
    selectAllMatching,
    clearSelection,
    confirmBulkDelete,
  } = useBulkSelection({
    rows,
    total,
    resetOn: [filters, reloadKey],
    fetchAllIds: async () => {
      const params = {};
      filterKeys.forEach((key) => {
        const value = filters[key];
        if (value !== "" && value !== null && value !== undefined && value !== "all") params[key] = value;
      });

      const response = await api.ids(params);
      return response.data.ids;
    },
    bulkRemove: (ids) => api.bulkRemove(ids),
    onSelectAllError: (error) => {
      console.error(`Failed to select all ${plural}:`, error);
      setToast({ type: "error", message: `Could not select all ${plural.toLowerCase()}. Please try again.` });
    },
    onDeleted: async (ids) => {
      // Parent refresh bumps refreshKey (reloads the list); otherwise reload here.
      if (onDataChanged) onDataChanged();
      else await fetchRows(page, filters);

      setToast({
        type: "success",
        message: `${ids.length} ${ids.length === 1 ? singular.toLowerCase() : plural.toLowerCase()} deleted successfully.`,
      });
    },
    onDeleteError: (error) => {
      console.error("Bulk delete failed:", error);
      setToast({
        type: "error",
        message: `Failed to delete selected ${plural.toLowerCase()}. Please try again.`,
      });
    },
  });

  const {
    target: toDelete,
    deleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useSingleDelete({
    remove: removeRecord || ((row) => api.remove(row.id)),
    onDeleted: async () => {
      if (onDataChanged) onDataChanged();
      else await fetchRows(page, filters);

      setToast({ type: "success", message: deleteSuccessMessage || `${singular} deleted successfully.` });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      setToast({
        type: "error",
        message: getDeleteErrorMessage
          ? getDeleteErrorMessage(error)
          : `Failed to delete ${singular.toLowerCase()}. Please try again.`,
      });
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setShowForm(true);
  };

  const handleEdit = (row) => {
    setSelected(row);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelected(null);
  };

  const handleRowClick = (row) => {
    navigate(getRowPath ? getRowPath(row) : `${basePath}/${row.id}`, {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const handleSave = async (formData) => {
    const isEdit = Boolean(selected);

    try {
      if (isEdit) {
        await api.update(selected.id, formData);
      } else {
        await api.create(formData);
      }

      closeForm();
      await fetchRows(page, filters);
      setToast({
        type: "success",
        message: `${singular} ${isEdit ? "updated" : "added"} successfully!`,
      });
    } catch (error) {
      console.error("Save failed:", error);
      const data = error.response?.data;

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

  return (
    <div className="space-y-2">
      {toastElement}

      <ListFilters
        fields={filterFields}
        appliedFilters={filters}
        onFilter={applyFilters}
        onClear={clearFilters}
        clearLabel={clearLabel}
      />

      {renderAboveTable?.({ filters, reloadKey })}

      {selectable && selectedCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-primary-50 border border-primary-100 rounded-2xl px-3 sm:px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-primary-700 font-medium text-sm">
              <CheckCircle2 size={16} />
              {allMatchingSelected
                ? `All ${selectedCount} ${plural} Selected`
                : `${selectedCount} ${selectedCount === 1 ? singular : plural} Selected`}
            </div>

            {showSelectAllMatching && (
              <button
                type="button"
                onClick={selectAllMatching}
                disabled={selectingAll}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {selectingAll ? "Selecting..." : `Select all ${total}`}
              </button>
            )}

            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Clear selection
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkConfirm(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-danger bg-red-50 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={15} />
            Delete Selected
          </button>
        </div>
      )}

      <DataTable
        title={title}
        itemLabel={plural.toLowerCase()}
        addLabel={addLabel}
        columns={columns}
        data={rows}
        loading={loading}
        page={page}
        total={total}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        setPage={setPage}
        onAdd={canEdit ? handleAdd : undefined}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canEdit ? requestDelete : undefined}
        onRowClick={handleRowClick}
        rowActions={rowActions ? (row) => rowActions(row, { requestDelete }) : undefined}
        getRowLabel={getName}
        showTotal={showTotal}
        selectedIds={selectable ? selectedIds : undefined}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
      />

      {selectable && (
        <ConfirmDeleteModal
          open={showBulkConfirm}
          title={`Delete ${selectedCount} ${selectedCount === 1 ? singular : plural}?`}
          message={`Are you sure you want to delete the selected ${plural.toLowerCase()}?`}
          confirmLabel={`Delete ${plural}`}
          loading={bulkDeleting}
          onCancel={() => !bulkDeleting && setShowBulkConfirm(false)}
          onConfirm={confirmBulkDelete}
        />
      )}

      {canEdit && showForm && (
        <FormModal
          title={selected ? `Edit ${singular}` : addLabel}
          onClose={closeForm}
        >
          <FormComponent
            initialData={selected || {}}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        </FormModal>
      )}

      <ConfirmDeleteModal
        open={Boolean(toDelete)}
        title={`Delete ${singular}?`}
        message={`Are you sure you want to delete ${toDelete && getName ? getName(toDelete) : ""}?`}
        confirmLabel={`Delete ${singular}`}
        loading={deleting}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}