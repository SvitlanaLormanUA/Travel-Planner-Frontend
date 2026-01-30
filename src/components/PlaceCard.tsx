"use client";

import { useState } from "react";
import { Place, updatePlace } from "@/lib/api";
import Modal from "@/components/Modal";

const IIIF_BASE = "https://www.artic.edu/iiif/2";

interface Props {
  place: Place;
  onUpdated: (updated: Place) => void;
}

export default function PlaceCard({ place, onUpdated }: Props) {
  const [notes, setNotes] = useState(place.notes || "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const imageUrl = place.image_id
    ? `${IIIF_BASE}/${place.image_id}/full/300,/0/default.jpg`
    : null;

  async function handleToggleVisited() {
    setLoading(true);
    try {
      const updated = await updatePlace(place.project_id, place.id, {
        visited: !place.visited,
      });
      onUpdated(updated);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveNotes() {
    setLoading(true);
    try {
      const updated = await updatePlace(place.project_id, place.id, { notes });
      onUpdated(updated);
      setEditingNotes(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
        {imageUrl && (
          <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
            <img
              src={imageUrl}
              alt={place.title || "Artwork"}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{place.title || "Untitled"}</h3>
              {place.artist_display && (
                <p className="text-sm text-gray-600">{place.artist_display}</p>
              )}
              {place.place_of_origin && (
                <p className="text-sm text-gray-500">Origin: {place.place_of_origin}</p>
              )}
            </div>
            <button
              onClick={handleToggleVisited}
              disabled={loading}
              className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                place.visited
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {place.visited ? "Visited" : "Not visited"}
            </button>
          </div>

          <div className="mt-3">
            {editingNotes ? (
              <div className="flex gap-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Add notes..."
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleSaveNotes}
                    disabled={loading}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setNotes(place.notes || "");
                      setEditingNotes(false);
                    }}
                    className="text-xs text-gray-500 px-3 py-1 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {place.notes || "Add notes..."}
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={!!errorMsg}
        onClose={() => setErrorMsg("")}
        title="Error"
        actions={
          <button
            onClick={() => setErrorMsg("")}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            OK
          </button>
        }
      >
        <p>{errorMsg}</p>
      </Modal>
    </>
  );
}
