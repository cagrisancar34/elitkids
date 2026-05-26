"use client";

import { useState } from "react";

type ListPaginationOptions<T> = {
  items: T[];
  pageSize?: number;
  resetKey?: string | number | boolean;
  resetPage?: number;
};

export function useListPagination<T>({
  items,
  pageSize = 8,
  resetKey,
  resetPage = 1,
}: ListPaginationOptions<T>) {
  const safePageSize = Math.max(1, pageSize);
  const [paginationState, setPaginationState] = useState(() => ({
    page: Math.max(1, resetPage),
    resetKey,
    resetPage,
  }));
  const totalItems = items.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / safePageSize));
  const shouldUseResetPage =
    paginationState.resetKey !== resetKey || paginationState.resetPage !== resetPage;
  const requestedPage = shouldUseResetPage ? Math.max(1, resetPage) : paginationState.page;
  const page = Math.min(Math.max(requestedPage, 1), pageCount);
  const startIndex = totalItems ? (page - 1) * safePageSize : 0;
  const endIndex = Math.min(startIndex + safePageSize, totalItems);

  function setPage(nextPage: number) {
    setPaginationState({
      page: Math.min(Math.max(nextPage, 1), pageCount),
      resetKey,
      resetPage,
    });
  }

  return {
    endIndex,
    page,
    pageCount,
    pageItems: items.slice(startIndex, endIndex),
    pageSize: safePageSize,
    setPage,
    startIndex,
    totalItems,
  };
}
