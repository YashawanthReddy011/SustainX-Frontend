import api from "../lib/api";
import type { SDG, SDGStats } from "../types";

export async function getSDGs(filters: { search?: string; category?: string; signal?: AbortSignal } = {}): Promise<SDG[]> {
  const response = await api.get<SDG[]>("/sdgs", {
    params: { search: filters.search, category: filters.category, limit: 100 },
    signal: filters.signal,
  });

  return response.data;
}

export async function getSDGStats(): Promise<SDGStats> {
  const response = await api.get<SDGStats>("/sdgs/stats");
  return response.data;
}

export async function getSDG(id: number): Promise<SDG> {
  const response = await api.get(`/sdgs/${id}`);

  return response.data;
}
