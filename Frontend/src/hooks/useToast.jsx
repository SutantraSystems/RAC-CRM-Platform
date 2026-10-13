import React, { useCallback, useRef, useState } from "react";
import Toast from "../components/ui/Toast";

// Shared toast state. Usage:
//   const { setToast, toastElement } = useToast();
//   setToast({ type: "success", message: "Saved!" });   // show
//   setToast(null);                                      // hide
//   ...render {toastElement} anywhere in the JSX.
export default function useToast() {
  const [toast, setToastState] = useState(null);
  const seq = useRef(0);

  const setToast = useCallback((next) => {
    // A fresh key restarts the auto-dismiss timer when a new toast replaces an old one.
    setToastState(next ? { ...next, _key: ++seq.current } : null);
  }, []);

  const handleClose = useCallback(() => setToastState(null), []);

  const toastElement = toast ? (
    <Toast
      key={toast._key}
      message={toast.message}
      type={toast.type}
      onClose={handleClose}
    />
  ) : null;

  return { setToast, toastElement };
}