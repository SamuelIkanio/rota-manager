export type ShiftCode =
  | "D"
  | "DS"
  | "N"
  | "T"
  | "AL"
  | "X"
  | "R"
  | "S"
  | "OS"
  | "OC"
  | "SS"
  | "SN"
  | "OFF";

export interface ShiftType {
  code: ShiftCode;
  label: string;
  description: string;
  color: string;
  textColor: string;
  hours: number;
  startTime?: string;
  endTime?: string;
}

export const SHIFT_TYPES: Record<ShiftCode, ShiftType> = {
  D: {
    code: "D",
    label: "Day",
    description: "Full Day",
    color: "#2563EB",
    textColor: "#FFFFFF",
    hours: 12,
    startTime: "08:00",
    endTime: "20:00",
  },
  DS: {
    code: "DS",
    label: "Day Sleep",
    description: "Day Sleep",
    color: "#7C3AED",
    textColor: "#FFFFFF",
    hours: 15,
    startTime: "08:00",
    endTime: "23:00",
  },
  N: {
    code: "N",
    label: "Night",
    description: "Nightshift",
    color: "#1E3A5F",
    textColor: "#FFFFFF",
    hours: 12,
    startTime: "20:00",
    endTime: "08:00",
  },
  T: {
    code: "T",
    label: "Training",
    description: "Training",
    color: "#D97706",
    textColor: "#FFFFFF",
    hours: 7.5,
  },
  AL: {
    code: "AL",
    label: "Ann. Leave",
    description: "Annual Leave",
    color: "#059669",
    textColor: "#FFFFFF",
    hours: 0,
  },
  X: {
    code: "X",
    label: "Sick",
    description: "Sick Leave",
    color: "#DC2626",
    textColor: "#FFFFFF",
    hours: 0,
  },
  R: {
    code: "R",
    label: "Req. Off",
    description: "Requested Day Off",
    color: "#EA580C",
    textColor: "#FFFFFF",
    hours: 0,
  },
  S: {
    code: "S",
    label: "Super",
    description: "Supernumerary",
    color: "#64748B",
    textColor: "#FFFFFF",
    hours: 12,
  },
  OS: {
    code: "OS",
    label: "On Site",
    description: "On Site",
    color: "#0891B2",
    textColor: "#FFFFFF",
    hours: 12,
  },
  OC: {
    code: "OC",
    label: "On Call",
    description: "On Call",
    color: "#65A30D",
    textColor: "#FFFFFF",
    hours: 8,
  },
  SS: {
    code: "SS",
    label: "Sleep Sup",
    description: "Sleep Support",
    color: "#DB2777",
    textColor: "#FFFFFF",
    hours: 8,
  },
  SN: {
    code: "SN",
    label: "Sleep Night",
    description: "Sleep Night",
    color: "#4F46E5",
    textColor: "#FFFFFF",
    hours: 8,
  },
  OFF: {
    code: "OFF",
    label: "Off",
    description: "Day Off",
    color: "#E2E8F0",
    textColor: "#94A3B8",
    hours: 0,
  },
};

export const SHIFT_CODES: ShiftCode[] = [
  "D",
  "DS",
  "N",
  "T",
  "AL",
  "X",
  "R",
  "S",
  "OS",
  "OC",
  "SS",
  "SN",
  "OFF",
];

export function getShiftHours(code: ShiftCode): number {
  return SHIFT_TYPES[code]?.hours ?? 0;
}
