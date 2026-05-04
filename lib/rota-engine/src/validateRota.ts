import { DailyRota, Staff } from "./generateRota";

export function validateWeeklyRota(weeklyRota: DailyRota[]) {
  const staffHours: Record<string, number> = {};
  const warnings: string[] = [];

  for (const day of weeklyRota) {
    const allShifts = [
      ...day.day.map((staff) => ({ staff, hours: 12, shift: "day" })),
      ...day.sleepIn.map((staff) => ({ staff, hours: 12, shift: "sleep-in" })),
      ...day.wakingNight.map((staff) => ({ staff, hours: 12, shift: "waking night" })),
    ];

    for (const item of allShifts) {
      staffHours[item.staff.id] =
        (staffHours[item.staff.id] || 0) + item.hours;

      if (staffHours[item.staff.id] > item.staff.maxHoursPerWeek) {
        warnings.push(
          `${item.staff.name} is over weekly hours: ${staffHours[item.staff.id]} / ${item.staff.maxHoursPerWeek}`
        );
      }
    }
  }

  return {
    staffHours,
    warnings,
  };
}