"use client";

import { useEffect, useState } from "react";
import { ProjectListItem, listProjects, deleteProject } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import ErrorMessage from "@/components/ErrorMessage";
import Modal from "@/components/Modal";

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalError, setModalError] = useState("");

  async function fetchProjects() {
    setLoading(true);
    setError("");
    try {
      const data = await listProjects(page, 10, statusFilter || undefined);
      setProjects(data.items);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter]);

  async function handleDelete(id: number) {
    try {
      await deleteProject(id);
      fetchProjects();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to delete project");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Travel Projects</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects yet.</p>
          <a
            href="/projects/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first project
          </a>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!modalError}
        onClose={() => setModalError("")}
        title="Cannot Delete Project"
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
