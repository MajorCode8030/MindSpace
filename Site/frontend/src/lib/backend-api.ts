const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/").replace(/\/+$/, "");

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Falha na requisicao: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const backendApi = {
  listPacientes: <T>() => request<T>("/api/pacientes", "GET"),
  createPaciente: <T>(payload: unknown) => request<T>("/api/pacientes", "POST", payload),
  updatePaciente: <T>(id: string, payload: unknown) => request<T>(`/api/pacientes/${id}`, "PUT", payload),
  deletePaciente: (id: string) => request<void>(`/api/pacientes/${id}`, "DELETE"),
  createAnamnese: <T>(id: string, payload: unknown) => request<T>(`/api/pacientes/${id}/anamneses`, "POST", payload),
  createSessao: <T>(id: string, payload: unknown) => request<T>(`/api/pacientes/${id}/sessoes`, "POST", payload),
};
