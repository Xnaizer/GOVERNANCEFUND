import { api } from "../lib/api";
import { ProgramListItem, ProgramDetail } from "../types/program";
import { Pagination, PublicStats, DisplayTab } from "../types/common";

interface Envelope<T> {
  data: T;
  error: string | null;
  meta: {
    pagination?: Pagination;
  };
}

export async function fetchPrograms(params: {
  tab?: DisplayTab;
  page?: number;
  limit?: number;
}) {
  const res = await api.get<Envelope<ProgramListItem[]>>("/public/programs", {
    params,
  });
  return {
    programs: res.data.data,
    pagination: res.data.meta.pagination,
  };
}

export async function fetchProgram(id: number) {
  const res = await api.get<Envelope<ProgramDetail>>(`/public/programs/${id}`);
  return res.data.data;
}

export async function fetchStats() {
  const res = await api.get<Envelope<PublicStats>>("/public/stats");
  return res.data.data;
}
