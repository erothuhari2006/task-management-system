const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
  } catch {
    throw new Error("Cannot connect to the server. Check that the backend is running and VITE_API_URL is correct.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Something went wrong");
  return result;
}

export const taskApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && query.set(key, value));
    return request(`/tasks${query.size ? `?${query}` : ""}`);
  },
  create: (data) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/tasks/${id}`, { method: "DELETE" })
};
