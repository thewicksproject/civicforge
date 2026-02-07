"use client";

import { useState, useEffect } from "react";
import { searchNeighborhoods } from "@/app/actions/neighborhoods";

interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface NeighborhoodPickerProps {
  onSelect: (id: string) => void;
  selectedId?: string;
}

export function NeighborhoodPicker({
  onSelect,
  selectedId,
}: NeighborhoodPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const res = await searchNeighborhoods(query);
      if (res.success && res.data) {
        setResults(res.data);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        Find your neighborhood
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, city, or zip code..."
        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {loading && (
        <p className="text-sm text-muted-foreground">Searching...</p>
      )}

      {query.length >= 2 && results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => onSelect(n.id)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                selectedId === n.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <span className="font-medium text-sm">{n.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {n.city}, {n.state}
              </span>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">
            No neighborhoods found.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="text-sm text-primary font-medium hover:underline"
          >
            Create a new neighborhood
          </button>
        </div>
      )}

      {showCreate && (
        <input type="hidden" name="create_neighborhood" value="true" />
      )}

      {selectedId && (
        <input type="hidden" name="neighborhood_id" value={selectedId} />
      )}
    </div>
  );
}
