import { DailyRota } from "./generateRota";
import { RotaStatus } from "./rotaStatus";

export type SavedRota = {
  id: string;
  clientId: string;
  startDate: string;
  endDate: string;
  status: RotaStatus;
  rota: DailyRota[];
  createdAt: string;
  updatedAt: string;
};

export function createSavedRota(params: {
  clientId: string;
  startDate: string;
  endDate: string;
  rota: DailyRota[];
  status?: RotaStatus;
}): SavedRota {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    clientId: params.clientId,
    startDate: params.startDate,
    endDate: params.endDate,
    rota: params.rota,
    status: params.status || "draft",
    createdAt: now,
    updatedAt: now,
  };
}