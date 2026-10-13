import { useEffect, useState } from "react";

export default function useBulkSelection({
  rows,
  total,
  resetOn = [],
  fetchAllIds,
  bulkRemove,
  onSelectAllError,
  onDeleted,
  onDeleteError,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const clearSelection = () => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  };

  useEffect(() => {
    clearSelection();
  }, resetOn);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setAllMatchingSelected(false);
  };

  const toggleSelectAll = (checked) => {
    if (!checked && allMatchingSelected) {
      clearSelection();
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      rows.forEach((row) => (checked ? next.add(row.id) : next.delete(row.id)));
      return next;
    });
  };

  const selectAllMatching = async () => {
    try {
      setSelectingAll(true);
      const ids = await fetchAllIds();
      setSelectedIds(new Set(ids));
      setAllMatchingSelected(true);
    } catch (error) {
      onSelectAllError?.(error);
    } finally {
      setSelectingAll(false);
    }
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);

    try {
      setBulkDeleting(true);
      await bulkRemove(ids);

      setShowBulkConfirm(false);
      clearSelection();

      await onDeleted?.(ids);
    } catch (error) {
      onDeleteError?.(error, ids);
    } finally {
      setBulkDeleting(false);
    }
  };

  const selectedCount = selectedIds.size;
  const allOnPageSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
  const showSelectAllMatching = allOnPageSelected && !allMatchingSelected && total > rows.length;

  return {
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
  };
}