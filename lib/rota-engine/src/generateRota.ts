export type Staff = {
  id: string;
  name: string;
  maxHoursPerWeek: number;
  assignedHours: number;
  unavailableDates: string[];
  canDoDay: boolean;
  canDoSleepIn: boolean;
  canDoWakingNight: boolean;
  canContinueAfterSleepIn: boolean;
};

export type SupportPackage = {
  dayStaffRequired: number;
  sleepInStaffRequired: number;
  wakingNightStaffRequired: number;
  allowSleepInContinuation: boolean;
};

export type DailyRota = {
  date: string;
  day: Staff[];
  sleepIn: Staff[];
  wakingNight: Staff[];
  warnings: string[];
};

function pickStaff(
  staff: Staff[],
  date: string,
  needed: number,
  alreadyUsed: Staff[],
  filter: (s: Staff) => boolean
): Staff[] {
  const usedIds = new Set(alreadyUsed.map((s) => s.id));

  return staff
    .filter((s) => !usedIds.has(s.id))
    .filter((s) => !s.unavailableDates.includes(date))
    .filter(filter)
    .sort((a, b) => a.assignedHours - b.assignedHours)
    .slice(0, needed);
}

export function generateDailyRota(
  date: string,
  staff: Staff[],
  support: SupportPackage,
  previousSleepInStaff: Staff[] = []
): DailyRota {
  const warnings: string[] = [];

  const rota: DailyRota = {
    date,
    day: [],
    sleepIn: [],
    wakingNight: [],
    warnings,
  };

  const continuingStaff = support.allowSleepInContinuation
    ? previousSleepInStaff
        .filter((s) => s.canContinueAfterSleepIn)
        .slice(0, support.dayStaffRequired)
    : [];

  rota.day.push(...continuingStaff);

  const extraDayNeeded = support.dayStaffRequired - rota.day.length;

  rota.day.push(
    ...pickStaff(staff, date, extraDayNeeded, rota.day, (s) => s.canDoDay)
  );

  rota.sleepIn.push(
    ...pickStaff(
      staff,
      date,
      support.sleepInStaffRequired,
      rota.day,
      (s) => s.canDoSleepIn
    )
  );

  rota.wakingNight.push(
    ...pickStaff(
      staff,
      date,
      support.wakingNightStaffRequired,
      [...rota.day, ...rota.sleepIn],
      (s) => s.canDoWakingNight
    )
  );

  if (rota.day.length < support.dayStaffRequired) {
    warnings.push(`Not enough day staff for ${date}`);
  }

  if (rota.sleepIn.length < support.sleepInStaffRequired) {
    warnings.push(`Not enough sleep-in staff for ${date}`);
  }

  if (rota.wakingNight.length < support.wakingNightStaffRequired) {
    warnings.push(`Not enough waking night staff for ${date}`);
  }

  return rota;
}