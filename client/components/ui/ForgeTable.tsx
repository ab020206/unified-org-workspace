'use client';

import React, { useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye, Inbox } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface ForgeTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  accentModule?: 'support' | 'reviews' | 'audit' | 'ai' | 'security' | 'notifications' | 'collaboration';
}

export function ForgeTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items in this view.',
  emptyAction,
  onRowClick,
  accentModule: _accentModule = 'support',
}: ForgeTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((d) => d.id)));
    }
  };

  const handleSelectOne = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-[10px] border border-[#D9D9D9] bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead className="bg-[#F2F2F2] border-b border-[#D9D9D9] sticky top-0 z-10">
            <tr>
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={handleSelectAll}
                  className="rounded border-[#D9D9D9] text-[#174D38] focus:ring-[#174D38] accent-[#174D38] cursor-pointer"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-mono font-medium text-[#6B7280] uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-[#1F1F1F] transition-colors"
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown className="w-3 h-3 text-[#6B7280]" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              <th className="w-12 px-4 py-3 text-right text-xs font-mono font-medium text-[#6B7280]">
                Action
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-[#D9D9D9] text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-center">
                    <LoadingSkeleton className="h-4 w-4 mx-auto" />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <LoadingSkeleton className="h-4 w-full" />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <LoadingSkeleton className="h-4 w-6 ml-auto" />
                  </td>
                </tr>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "group hover:bg-[#F2F2F2]/60 transition-colors cursor-pointer select-none",
                      isSelected && "bg-[#174D38]/5"
                    )}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(row.id, e as any)}
                        className="rounded border-[#D9D9D9] text-[#174D38] focus:ring-[#174D38] accent-[#174D38] cursor-pointer"
                      />
                    </td>

                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3 font-normal text-[#1F1F1F]", col.className)}>
                        {col.accessor ? col.accessor(row) : (row as any)[col.key]}
                      </td>
                    ))}

                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRowClick?.(row)}
                        className="p-1 rounded text-[#6B7280] hover:text-[#174D38] hover:bg-[#F2F2F2] transition-colors"
                        title="Inspect details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#F2F2F2] flex items-center justify-center text-[#6B7280] mb-1">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#1F1F1F]">{emptyTitle}</h3>
                    <p className="text-xs text-[#6B7280] max-w-sm">{emptyDescription}</p>
                    {emptyAction && <div className="pt-2">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {!isLoading && data.length > 0 && (
        <div className="px-4 py-3 border-t border-[#D9D9D9] bg-[#F2F2F2]/40 flex items-center justify-between text-xs text-[#6B7280] font-mono">
          <div>
            Showing <span className="font-semibold text-[#1F1F1F]">{Math.min(data.length, (currentPage - 1) * pageSize + 1)}</span>-
            <span className="font-semibold text-[#1F1F1F]">{Math.min(data.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-[#1F1F1F]">{data.length}</span> items
            {selectedIds.size > 0 && (
              <span className="ml-2 font-sans text-[#174D38]">({selectedIds.size} selected)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#F2F2F2] disabled:opacity-40 transition-all text-[#1F1F1F]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-[#D9D9D9] bg-white hover:bg-[#F2F2F2] disabled:opacity-40 transition-all text-[#1F1F1F]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
