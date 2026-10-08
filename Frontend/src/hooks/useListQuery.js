import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function useListQuery(filterKeys, numericKeys = []) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get("page"), 10);
  const page = pageParam > 0 ? pageParam : 1;

  // Only changes when a filter VALUE changes (not when only the page does).
  const signature = filterKeys.map((key) => searchParams.get(key) || "").join("\u0001");

  const filters = useMemo(() => {
    const result = {};
    filterKeys.forEach((key) => {
      const raw = searchParams.get(key) || "";
      result[key] = numericKeys.includes(key) && /^\d+$/.test(raw) ? Number(raw) : raw;
    });
    return result;
  }, [signature]);

  // Bumped on Apply / Clear so the list refetches even if values are unchanged.
  const [reloadKey, setReloadKey] = useState(0);

  const writeParams = (nextPage, nextFilters = {}) => {
    const params = new URLSearchParams();

    if (nextPage > 1) params.set("page", String(nextPage));

    filterKeys.forEach((key) => {
      const value = nextFilters[key];
      if (value !== null && value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });

    setSearchParams(params, { replace: true });
  };

  const setPage = (next) => {
    const nextPage = typeof next === "function" ? next(page) : next;
    if (nextPage !== page) writeParams(nextPage, filters);
  };

  const applyFilters = (nextFilters) => {
    writeParams(1, nextFilters);
    setReloadKey((key) => key + 1);
  };

  const clearFilters = () => {
    writeParams(1, {});
    setReloadKey((key) => key + 1);
  };

  return { page, filters, reloadKey, setPage, writeParams, applyFilters, clearFilters };
}