"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
    if (!q || q.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        // API returns array of clients
        const clients: Client[] = (Array.isArray(data) ? data : data.clients || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => ({ id: c.id, name: c.name, email: c.email })
        );
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
    onChange(undefined, undefined);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((p) => (p < results.length - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((p) => (p > 0 ? p - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIdx]) handleSelect(results[selectedIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function handleBlur() {
    // If user typed something but didn't select, keep the text as free-text
    setTimeout(() => {
      if (!isOpen) return;
      setIsOpen(false);
      if (query.trim() && !clientId) {
        onChange(undefined, query.trim());
      }
    }, 200);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (query.length >= 1) { setIsOpen(true); searchClients(query); } }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un client..."
          className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all pr-8"
        />
        {clientId && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            aria-label="Effacer le client"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {loading && results.length === 0 && (
            <div className="px-3 py-3 text-center text-[12px] text-[#999]">
              Recherche...
            </div>
          )}
          {results.map((client, i) => (
            <button
              key={client.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(client); }}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`w-full text-left px-3 py-2.5 transition-colors cursor-pointer ${
                i === selectedIdx ? "bg-[#F7F7F5]" : "hover:bg-[#FBFBFA]"
              }`}
            >
              <div className="text-[13px] font-medium text-[#1A1A1A]">
                {client.name}
              </div>
              {client.email && (
                <div className="text-[11px] text-[#999]">{client.email}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected indicator */}
      {clientId && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-[11px] text-[#10B981] font-medium">Lie au client</span>
        </div>
      )}
    </div>
  );
}
