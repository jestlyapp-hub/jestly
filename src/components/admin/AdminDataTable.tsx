"use client";

import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  filters?: string[];
  activeFilters?: string[];
  onFilterToggle?: (filter: string) => void;
  onExport?: () => void;
  onRowClick?: (row: T) => void;
}

// ── Composant ─────────────────────────────────────────────────────
export default function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onSort,
  onSearch,
  loading = false,
  emptyMessage = "Aucune donnee trouvee",
  filters,
  activeFilters = [],
  onFilterToggle,
  onExport,
  onRowClick,
}: AdminDataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  // ── Skeleton rows ──
  const renderSkeletonRows = () => (
    <>
      {Array.from({ length: pageSize }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="border-b border-[#F0F0EE]">
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-3">
              <div className="h-4 bg-[#F0F0EE] rounded animate-pulse w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-lg border border-[#E6E6E4] overflow-hidden">
      {/* ── Barre d'outils ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#F0F0EE]">
        {/* Recherche */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            strokeWidth={1.7}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ACACAA]"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-[7px] text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md text-[#191919] placeholder:text-[#ACACAA] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all duration-150"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ACACAA] hover:text-[#5A5A58] cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-[7px] text-[13px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] rounded-md hover:bg-[#F7F7F5] transition-colors duration-150 cursor-pointer"
            >
              <Download size={14} strokeWidth={1.7} />
              Exporter
            </button>
          )}
        </div>
      </div>

      {/* ── Filtres ── */}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F0F0EE]">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter);
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterToggle?.(filter)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-full transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]"
                    : "bg-[#F7F7F5] text-[#5A5A58] border border-[#E6E6E4] hover:bg-[#F0F0EE]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Tableau ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E6E6E4] bg-[#FAFAF9]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2.5 text-left text-[11px] font-semibold text-[#8A8A88] uppercase tracking-[0.04em] ${
                    col.sortable ? "cursor-pointer select-none hover:text-[#5A5A58]" : ""
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-[#CCCCCC]">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )
                        ) : (
                          <ArrowUpDown size={12} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderSkeletonRows()
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-[14px] text-[#8A8A88]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-[#F0F0EE] last:border-0 transition-colors duration-100 ${
                    onRowClick
                      ? "cursor-pointer hover:bg-[#FBFBFA]"
                      : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-[13px] text-[#191919]"
                    >
                      {col.render
                        ? col.render(row)
                        : (row[col.key] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E6E6E4]">
          <span className="text-[12px] text-[#8A8A88]">
            {startItem}–{endItem} sur {total}
          </span>
          <div className="flex items-center gap-1">
            <PaginationButton
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              icon={<ChevronsLeft size={14} />}
            />
            <PaginationButton
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              icon={<ChevronLeft size={14} />}
            />
            <span className="px-3 py-1 text-[12px] font-medium text-[#191919] min-w-[3rem] text-center">
              {page} / {totalPages}
            </span>
            <PaginationButton
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              icon={<ChevronRight size={14} />}
            />
            <PaginationButton
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              icon={<ChevronsRight size={14} />}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bouton de pagination ──────────────────────────────────────────
function PaginationButton({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors duration-150 ${
        disabled
          ? "text-[#D6D3D1] cursor-default"
          : "text-[#5A5A58] hover:bg-[#F7F7F5] cursor-pointer"
      }`}
    >
      {icon}
    </button>
  );
}
