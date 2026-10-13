import { useState } from "react";

export default function useSingleDelete({ remove, onDeleted, onError }) {
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const cancelDelete = () => {
    if (!deleting) setTarget(null);
  };

  const confirmDelete = async () => {
    if (!target) return;

    try {
      setDeleting(true);
      await remove(target);
      setTarget(null);
      await onDeleted?.(target);
    } catch (error) {
      onError?.(error, target);
    } finally {
      setDeleting(false);
    }
  };

  return { target, deleting, requestDelete: setTarget, cancelDelete, confirmDelete };
}