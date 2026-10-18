import api from "../lib/api";
import type { SDG } from "../types";

export async function getSDGs(): Promise<SDG[]> {
  const response = await api.get("/sdgs");

  return response.data;
}

export async function getSDG(id: number): Promise<SDG> {
  const response = await api.get(`/sdgs/${id}`);

  return response.data;
}
