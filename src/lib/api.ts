const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Types ---

export interface Place {
  id: number;
  project_id: number;
  external_id: number;
  title: string | null;
  artist_display: string | null;
  place_of_origin: string | null;
  image_id: string | null;
  notes: string | null;
  visited: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  places: Place[];
}

export interface ProjectListItem {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  status: string;
  place_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedProjects {
  items: ProjectListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ArtworkResult {
  id: number;
  title: string | null;
  artist_display: string | null;
  place_of_origin: string | null;
  image_id: string | null;
  thumbnail: string | null;
}

export interface ArtworkSearchResponse {
  results: ArtworkResult[];
  total: number;
  page: number;
}

// --- Project API ---

export function listProjects(
  page = 1,
  limit = 10,
  status?: string
): Promise<PaginatedProjects> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  return request(`/api/projects?${params}`);
}

export function getProject(id: number): Promise<Project> {
  return request(`/api/projects/${id}`);
}

export function createProject(data: {
  name: string;
  description?: string;
  start_date?: string;
  places?: { external_id: number; notes?: string }[];
}): Promise<Project> {
  return request("/api/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProject(
  id: number,
  data: { name?: string; description?: string; start_date?: string }
): Promise<Project> {
  return request(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: number): Promise<void> {
  return request(`/api/projects/${id}`, { method: "DELETE" });
}

// --- Place API ---

export function addPlace(
  projectId: number,
  data: { external_id: number; notes?: string }
): Promise<Place> {
  return request(`/api/projects/${projectId}/places`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePlace(
  projectId: number,
  placeId: number,
  data: { notes?: string; visited?: boolean }
): Promise<Place> {
  return request(`/api/projects/${projectId}/places/${placeId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// --- Artwork Search ---

export function searchArtworks(
  q: string,
  page = 1,
  limit = 10
): Promise<ArtworkSearchResponse> {
  const params = new URLSearchParams({
    q,
    page: String(page),
    limit: String(limit),
  });
  return request(`/api/artworks/search?${params}`);
}
