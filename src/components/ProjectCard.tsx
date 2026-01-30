"use client";

import { useState } from "react";
import Link from "next/link";
import { ProjectListItem } from "@/lib/api";
import Modal from "@/components/Modal";

interface Props {
  project: ProjectListItem;
  onDelete: (id: number) => void;
}

export default function ProjectCard({ project, onDelete }: Props) {
  const [showDelete, setShowDelete] = useState(false);

  const statusColor =
    project.status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/projects/${project.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {project.name}
          </Link>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColor}`}>
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex gap-4">
            {project.start_date && <span>Start: {project.start_date}</span>}
            <span>{project.place_count} place{project.place_count !== 1 ? "s" : ""}</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowDelete(true);
            }}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Project"
        actions={
          <>
            <button
              onClick={() => setShowDelete(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowDelete(false);
                onDelete(project.id);
              }}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
