"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/hooks/use-api";

interface Client {
  id: string;
  name: string;
  email?: string;
}

interface ClientAutocompleteProps {
  clientId?: string;
  clientName?: string;
  onChange: (clientId: string | undefined, clientName: string | undefined) => void;
}

export default function ClientAutocomplete({
  clientId,
  clientName,
  onChange,
}: ClientAutocompleteProps) {
  const [query, setQuery] = useState(clientName || "");
  const [results, setResults] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external prop changes
  useEffect(() => {
    setQuery(clientName || "");
  }, [clientName]);

  // Click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchClients = useCallback(async (q: string) => {
    setLoading(true);
    try {
      // Fetch clients — with query if provided, otherwise get recent/all
      const url = q.trim()
        ? `/api/clients?q=${encodeURIComponent(q.trim())}&status=active`
        : `/api/clients?status=active&sort=created_at&order=desc`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const clients: Client[] = (Array.isArray(data) ? data : data.clients || [])
          .slice(0, 20)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any) => ({ id: c.id, name: c.name, email: c.email }));
        setResults(clients);
        setSelectedIdx(0);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchClients(value), 200);

    // If user clears, also clear the selection
    if (!value.trim()) {
      onChange(undefined, undefined);
    }
  }

  function handleSelect(client: Client) {
    setQuery(client.name);
    setIsOpen(false);
    onChange(client.id, client.name);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onChange(undefined, undefined);
  }

  async function handleCreateClient() {
    const name = query.trim();
    if (!name || creating) return;

    // Check for obvious duplicate
    const existing = results.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      handleSelect(existing);
      return;
    }

    setCreating(true);
    try {
      const created = await apiFetch<{ id: string; name: string; email?: string }>("/api/clients", {
        body: { name },
      });
      setQuery(created.name);
      setIsOpen(false);
      onChange(created.id, created.name);
    } catch {
      // Silently fail — user can retry
    } finally {
      setCreating(false);
    }
  }

  function handleFocus() {
    setIsOpen(true);
    // Always fetch on focus — shows recent clients when empty
    searchClients(query);
  }

  // Check if current query matches any result exactly
  const trimmedQuery = query.trim();
  const exactMatch = results.some(c => c.name.toLowerCase() === trimmedQuery.toLowerCase());
  const showCreate = trimmedQuery.length > 0 && !exactMatch && !loading;

  // Total selectable options (results + optional create button)
  const totalOptions = results.length + (showCreate ? 1 : 0);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        handleFocus();
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(p => (p < totalOptions - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(p => (p > 0 ? p - 1 : totalOptions - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIdx < results.length && results[selectedIdx]) {
        handleSelect(results[selectedIdx]);
      } else if (showCreate && selectedIdx === results.length) {
        handleCreateClient();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const showDropdown = isOpen && (results.length > 0 || loading || showCreate);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher ou créer un client..."
          className={`w-full bg-white border rounded-lg px-3 py-2 text-[13px] text-[#191919] placeholder-[#B0B0AE] focus:outline-none transition-all pr-8 ${
            clientId
              ? "border-[#10B981]/30 bg-emerald-50/20"
              : "border-[#E6E6E4] focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
          }`}
        />
        {/* Clear button or search icon */}
        {clientId ? (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            aria-label="Retirer le client"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B0B0AE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E6E6E4] rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto py-1">
          {/* Loading */}
          {loading && results.length === 0 && !showCreate && (
            <div className="px-3 py-3 text-center text-[12px] text-[#B0B0AE]">
              Recherche...
            </div>
          )}

          {/* Empty state when no query */}
          {!loading && results.length === 0 && !trimmedQuery && (
            <div className="px-3 py-3 text-center text-[12px] text-[#B0B0AE]">
              Aucun client trouvé
            </div>
          )}

          {/* Results */}
          {results.map((client, i) => (
            <button
              key={client.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(client); }}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`w-full text-left px-3 py-2 transition-colors cursor-pointer flex items-center gap-3 ${
                i === selectedIdx ? "bg-[#EEF2FF]" : "hover:bg-[#FAFAF9]"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[10px] font-bold text-[#5A5A58] shrink-0">
                {client.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#191919] truncate">
                  {client.name}
                </div>
                {client.email && (
                  <div className="text-[11px] text-[#8A8A88] truncate">{client.email}</div>
                )}
              </div>
              {client.id === clientId && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" className="shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}

          {/* Create new client option */}
          {showCreate && (
            <>
              {results.length > 0 && <div className="border-t border-[#EFEFEF] mx-2 my-1" />}
              <button
                onMouseDown={(e) => { e.preventDefault(); handleCreateClient(); }}
                onMouseEnter={() => setSelectedIdx(results.length)}
                disabled={creating}
                className={`w-full text-left px-3 py-2.5 transition-colors cursor-pointer flex items-center gap-3 ${
                  selectedIdx === results.length ? "bg-[#EEF2FF]" : "hover:bg-[#FAFAF9]"
                } ${creating ? "opacity-50" : ""}`}
              >
                <div className="w-7 h-7 rounded-full bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#4F46E5]">
                    {creating ? "Création..." : `Créer « ${trimmedQuery} »`}
                  </div>
                  <div className="text-[11px] text-[#8A8A88]">Nouveau client</div>
                </div>
              </button>
            </>
          )}
        </div>
      )}

      {/* Selected indicator */}
      {clientId && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-[11px] text-[#10B981] font-medium">Lié au client</span>
        </div>
      )}
    </div>
  );
}
