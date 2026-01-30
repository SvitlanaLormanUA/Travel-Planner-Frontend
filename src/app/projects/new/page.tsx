"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArtworkResult, createProject } from "@/lib/api";
import ArtworkSearch from "@/components/ArtworkSearch";
import ErrorMessage from "@/components/ErrorMessage";

const IIIF_BASE = "https://www.artic.edu/iiif/2";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedArtworks, setSelectedArtworks] = useState<ArtworkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addedIds = new Set(selectedArtworks.map((a) => a.id));

  function handleAddArtwork(artwork: ArtworkResult) {
    if (selectedArtworks.length >= 10) {
      setError("Maximum 10 places per project.");
      return;
    }
    if (addedIds.has(artwork.id)) return;
    setSelectedArtworks((prev) => [...prev, artwork]);
    setError("");
  }

  function handleRemoveArtwork(id: number) {
    setSelectedArtworks((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        start_date: startDate || undefined,
        places: selectedArtworks.map((a) => ({ external_id: a.id })),
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Travel Project"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="A brief description of your travel project..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Places ({selectedArtworks.length}/10)
            </h2>
          </div>

          <ArtworkSearch onAdd={handleAddArtwork} addedIds={addedIds} />

          {selectedArtworks.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium text-gray-700">Selected places:</h3>
              {selectedArtworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  {artwork.thumbnail && (
                    <img
                      src={artwork.thumbnail}
                      alt={artwork.title || "Artwork"}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {artwork.title || "Untitled"}
                    </p>
                    {artwork.place_of_origin && (
                      <p className="text-xs text-gray-500">
                        Origin: {artwork.place_of_origin}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveArtwork(artwork.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
