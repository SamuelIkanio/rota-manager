import { generateDailyRota, Staff, SupportPackage, DailyRota } from "./generateRota";

export function generateWeeklyRota(
  startDate: string,
  staff: Staff[],
  support: SupportPackage
): DailyRota[] {
  const weeklyRota: DailyRota[] = [];
  let previousSleepInStaff: Staff[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dateString = date.toISOString().split("T")[0];

    const dailyRota = generateDailyRota(
      dateString,
      staff,
      support,
      previousSleepInStaff
    );

    weeklyRota.push(dailyRota);

    previousSleepInStaff = dailyRota.sleepIn;
  }

  return weeklyRota;
}