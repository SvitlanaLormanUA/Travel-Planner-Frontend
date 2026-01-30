"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Project, Place, getProject, addPlace, updateProject, ArtworkResult } from "@/lib/api";
import PlaceCard from "@/components/PlaceCard";
import ArtworkSearch from "@/components/ArtworkSearch";
import ErrorMessage from "@/components/ErrorMessage";
import Modal from "@/components/Modal";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [addingPlace, setAddingPlace] = useState(false);
  const [modalError, setModalError] = useState("");

  // Edit state
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  async function fetchProject() {
    setLoading(true);
    setError("");
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) fetchProject();
  }, [projectId]);

  function openEditModal() {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditStartDate(project.start_date || "");
    setShowEdit(true);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      const updated = await updateProject(projectId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        start_date: editStartDate || undefined,
      });
      setProject({ ...project!, ...updated });
      setShowEdit(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setEditLoading(false);
    }
  }

  function handlePlaceUpdated(updated: Place) {
    if (!project) return;
    const updatedPlaces = project.places.map((p) =>
      p.id === updated.id ? updated : p
    );
    const allVisited =
      updatedPlaces.length > 0 && updatedPlaces.every((p) => p.visited);
    setProject({
      ...project,
      places: updatedPlaces,
      status: allVisited ? "completed" : project.status,
    });
  }

  async function handleAddPlace(artwork: ArtworkResult) {
    if (!project) return;
    setAddingPlace(true);
    try {
      const place = await addPlace(projectId, { external_id: artwork.id });
      setProject({
        ...project,
        places: [...project.places, place],
      });
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to add place");
    } finally {
      setAddingPlace(false);
    }
  }

  if (loading) {
    return <p className="text-gray-500 text-center py-12">Loading project...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorMessage message={error} />
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Back to projects
        </button>
      </div>
    );
  }

  if (!project) return null;

  const addedIds = new Set(project.places.map((p) => p.external_id));
  const statusColor =
    project.status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  return (
    <div>
      <button
        onClick={() => router.push("/")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Back to projects
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-1">{project.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              {project.start_date && <span>Start: {project.start_date}</span>}
              <span>
                {project.places.length} place
                {project.places.length !== 1 ? "s" : ""}
              </span>
              <span>
                {project.places.filter((p) => p.visited).length} visited
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openEditModal}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}
            >
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Places</h2>
        {project.places.length < 10 && (
          <button
            onClick={() => setShowAddPlace(!showAddPlace)}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAddPlace ? "Hide Search" : "Add Place"}
          </button>
        )}
      </div>

      {showAddPlace && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <ArtworkSearch onAdd={handleAddPlace} addedIds={addedIds} />
        </div>
      )}

      {project.places.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No places added yet. Search and add artworks above.
        </p>
      ) : (
        <div className="space-y-4">
          {project.places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onUpdated={handlePlaceUpdated}
            />
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Project"
        actions={
          <>
            <button
              onClick={() => setShowEdit(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={editLoading || !editName.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {editLoading ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        open={!!modalError}
        onClose={() => setModalError("")}
        title="Error"
        actions={
          <button
            onClick={() => setModalError("")}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            OK
          </button>
        }
      >
        <p>{modalError}</p>
      </Modal>
    </div>
  );
}
