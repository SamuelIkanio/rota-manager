import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { ShiftCode, getShiftHours } from "@/constants/shiftTypes";

export interface StaffMember {
  id: string;
  name: string;
  contractedHours: number;
  role: string;
  team: string;
}

export interface ShiftEntry {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftCode;
  hours: number;
  notes?: string;
}

interface RotaContextType {
  staff: StaffMember[];
  shifts: ShiftEntry[];
  addStaff: (s: Omit<StaffMember, "id">) => void;
  updateStaff: (s: StaffMember) => void;
  deleteStaff: (id: string) => void;
  setShift: (entry: Omit<ShiftEntry, "id">) => void;
  clearShift: (staffId: string, date: string) => void;
  getShiftsForMonth: (year: number, month: number) => ShiftEntry[];
  getShiftsForStaff: (
    staffId: string,
    year: number,
    month: number
  ) => ShiftEntry[];
  getHoursWorked: (staffId: string, year: number, month: number) => number;
  applyGeneratedShifts: (newShifts: Omit<ShiftEntry, "id">[]) => void;
}

const RotaContext = createContext<RotaContextType | null>(null);

const STAFF_KEY = "@rota_staff_v1";
const SHIFTS_KEY = "@rota_shifts_v1";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function RotaProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [sRaw, shRaw] = await Promise.all([
          AsyncStorage.getItem(STAFF_KEY),
          AsyncStorage.getItem(SHIFTS_KEY),
        ]);
        if (sRaw) setStaff(JSON.parse(sRaw));
        if (shRaw) setShifts(JSON.parse(shRaw));
      } catch {}
    })();
  }, []);

  const persistStaff = useCallback(async (s: StaffMember[]) => {
    setStaff(s);
    await AsyncStorage.setItem(STAFF_KEY, JSON.stringify(s));
  }, []);

  const persistShifts = useCallback(async (s: ShiftEntry[]) => {
    setShifts(s);
    await AsyncStorage.setItem(SHIFTS_KEY, JSON.stringify(s));
  }, []);

  const addStaff = useCallback(
    (s: Omit<StaffMember, "id">) => {
      persistStaff([...staff, { ...s, id: genId() }]);
    },
    [staff, persistStaff]
  );

  const updateStaff = useCallback(
    (s: StaffMember) => {
      persistStaff(staff.map((m) => (m.id === s.id ? s : m)));
    },
    [staff, persistStaff]
  );

  const deleteStaff = useCallback(
    (id: string) => {
      persistStaff(staff.filter((m) => m.id !== id));
      persistShifts(shifts.filter((sh) => sh.staffId !== id));
    },
    [staff, shifts, persistStaff, persistShifts]
  );

  const setShift = useCallback(
    (entry: Omit<ShiftEntry, "id">) => {
      const existing = shifts.find(
        (s) => s.staffId === entry.staffId && s.date === entry.date
      );
      if (existing) {
        persistShifts(
          shifts.map((s) =>
            s.id === existing.id ? { ...entry, id: existing.id } : s
          )
        );
      } else {
        persistShifts([...shifts, { ...entry, id: genId() }]);
      }
    },
    [shifts, persistShifts]
  );

  const clearShift = useCallback(
    (staffId: string, date: string) => {
      persistShifts(
        shifts.filter((s) => !(s.staffId === staffId && s.date === date))
      );
    },
    [shifts, persistShifts]
  );

  const getShiftsForMonth = useCallback(
    (year: number, month: number) => {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return shifts.filter((s) => s.date.startsWith(prefix));
    },
    [shifts]
  );

  const getShiftsForStaff = useCallback(
    (staffId: string, year: number, month: number) => {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return shifts.filter(
        (s) => s.staffId === staffId && s.date.startsWith(prefix)
      );
    },
    [shifts]
  );

  const getHoursWorked = useCallback(
    (staffId: string, year: number, month: number) => {
      return getShiftsForStaff(staffId, year, month).reduce(
        (sum, s) => sum + (s.hours ?? getShiftHours(s.shiftType)),
        0
      );
    },
    [getShiftsForStaff]
  );

  const applyGeneratedShifts = useCallback(
    (newShifts: Omit<ShiftEntry, "id">[]) => {
      const dates = new Set(newShifts.map((s) => s.date));
      const ids = new Set(newShifts.map((s) => s.staffId));
      const remaining = shifts.filter(
        (s) => !(dates.has(s.date) && ids.has(s.staffId))
      );
      const withIds = newShifts.map((s) => ({ ...s, id: genId() }));
      persistShifts([...remaining, ...withIds]);
    },
    [shifts, persistShifts]
  );

  return (
    <RotaContext.Provider
      value={{
        staff,
        shifts,
        addStaff,
        updateStaff,
        deleteStaff,
        setShift,
        clearShift,
        getShiftsForMonth,
        getShiftsForStaff,
        getHoursWorked,
        applyGeneratedShifts,
      }}
    >
      {children}
    </RotaContext.Provider>
  );
}

export function useRota() {
  const ctx = useContext(RotaContext);
  if (!ctx) throw new Error("useRota must be within RotaProvider");
  return ctx;
}
