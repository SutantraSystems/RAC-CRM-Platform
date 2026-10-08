import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useListQuery from "../../hooks/useListQuery";
import ListFilters from "./ListFilters";
import DataTable from "./DataTable";
import FormModal from "./FormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import Toast from "../ui/Toast";
import { PAGE_SIZE, getErrorMessage, getFieldErrors } from "../../config/crmConfig";


export default function ModuleListPage({
  api,              
  basePath,        
  title,            
  singular,         
  plural,           
  addLabel,         
  filterFields,     
  columns,          
  FormComponent,  
  getName,          
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const filterKeys = useMemo(() => filterFields.map((f) => f.key), [filterFields]);
  const numericKeys = useMemo(
    () => filterFields.filter((f) => f.type === "year").map((f) => f.key),
    [filterFields]
  );

  const { page, filters, reloadKey, setPage, writeParams, applyFilters, clearFilters } =
    useListQuery(filterKeys, numericKeys);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const requestId = useRef(0);

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

    try {
      const response = await api.list(buildParams(pageNumber, filtersData));
      if (current !== requestId.current) return;

      setRows(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      // Page in the URL no longer exists -> fall back to page 1.
      if (error.response?.status === 404 && pageNumber > 1) {
        writeParams(1, filtersData);
        return;
      }
      console.error(`Error loading ${plural}:`, error);
      setToast({ type: "error", message: `Could not load ${plural.toLowerCase()}.` });
    }
  };

  useEffect(() => {
    fetchRows(page, filters);
  }, [page, filters, reloadKey]);

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
    navigate(`${basePath}/${row.id}`, {
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

  const handleConfirmDelete = async () => {
    if (!toDelete) return;

    try {
      setDeleting(true);
      await api.remove(toDelete.id);
      setToDelete(null);
      await fetchRows(page, filters);
      setToast({ type: "success", message: `${singular} deleted successfully.` });
    } catch (error) {
      console.error("Delete failed:", error);
      setToast({
        type: "error",
        message: `Failed to delete ${singular.toLowerCase()}. Please try again.`,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <ListFilters
        fields={filterFields}
        appliedFilters={filters}
        onFilter={applyFilters}
        onClear={clearFilters}
      />

      <DataTable
        title={title}
        itemLabel={plural.toLowerCase()}
        addLabel={addLabel}
        columns={columns}
        data={rows}
        page={page}
        total={total}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        setPage={setPage}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={setToDelete}
        onRowClick={handleRowClick}
      />

      {showForm && (
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
        message={`Are you sure you want to delete ${toDelete ? getName(toDelete) : ""}?`}
        confirmLabel={`Delete ${singular}`}
        loading={deleting}
        onCancel={() => !deleting && setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}