"use client";

import { useState } from "react";
import { ArtworkResult, searchArtworks } from "@/lib/api";

interface Props {
  onAdd: (artwork: ArtworkResult) => void;
  addedIds: Set<number>;
}

export default function ArtworkSearch({ onAdd, addedIds }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArtworkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await searchArtworks(query.trim());
      setResults(data.results);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
          placeholder="Search artworks (e.g., Monet, landscape, Paris)..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      {results.length > 0 && (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {results.map((artwork) => (
            <div
              key={artwork.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              {artwork.thumbnail && (
                <img
                  src={artwork.thumbnail}
                  alt={artwork.title || "Artwork"}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {artwork.title || "Untitled"}
                </p>
                {artwork.artist_display && (
                  <p className="text-xs text-gray-500 truncate">{artwork.artist_display}</p>
                )}
                {artwork.place_of_origin && (
                  <p className="text-xs text-gray-400">Origin: {artwork.place_of_origin}</p>
                )}
              </div>
              <button
                onClick={() => onAdd(artwork)}
                disabled={addedIds.has(artwork.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded transition-colors flex-shrink-0 ${
                  addedIds.has(artwork.id)
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {addedIds.has(artwork.id) ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-gray-500 text-sm text-center py-4">No results found.</p>
      )}
    </div>
  );
}
