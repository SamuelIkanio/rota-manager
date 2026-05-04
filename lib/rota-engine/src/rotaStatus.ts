export type RotaStatus = "draft" | "published" | "locked";

export function canEditRota(status: RotaStatus): boolean {
  return status === "draft";
}

export function canStaffViewRota(status: RotaStatus): boolean {
  return status === "published" || status === "locked";
}