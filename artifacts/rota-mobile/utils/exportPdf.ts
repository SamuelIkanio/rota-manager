import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform, Alert } from "react-native";

import { SHIFT_TYPES, ShiftCode } from "@/constants/shiftTypes";
import { StaffMember, ShiftEntry } from "@/context/RotaContext";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function buildHtml(
  year: number,
  month: number,
  staff: StaffMember[],
  shifts: ShiftEntry[]
): string {
  const days = getDaysInMonth(year, month);
  const monthName = MONTH_NAMES[month - 1];
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  const shiftMap: Record<string, ShiftCode> = {};
  for (const s of shifts) {
    if (s.date.startsWith(prefix)) {
      shiftMap[`${s.staffId}_${s.date}`] = s.shiftType;
    }
  }

  const dayHeaders = Array.from({ length: days }, (_, i) => {
    const d = new Date(year, month - 1, i + 1);
    const dayName = d.toLocaleDateString("en-GB", { weekday: "short" });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    return `<th class="${isWeekend ? "weekend" : ""}">${dayName}<br/>${i + 1}</th>`;
  }).join("");

  const rows = staff.map((member) => {
    let totalHours = 0;
    const cells = Array.from({ length: days }, (_, i) => {
      const dateStr = `${prefix}-${String(i + 1).padStart(2, "0")}`;
      const code = shiftMap[`${member.id}_${dateStr}`];
      if (!code) return `<td class="empty"></td>`;
      const shift = SHIFT_TYPES[code];
      totalHours += shift.hours;
      return `<td style="background:${shift.color};color:${shift.textColor};">${code}</td>`;
    }).join("");

    return `
      <tr>
        <td class="staff-name">${member.name}</td>
        ${cells}
        <td class="total">${totalHours}h</td>
      </tr>`;
  }).join("");

  const legend = Object.values(SHIFT_TYPES)
    .filter((s) => s.code !== "OFF")
    .map(
      (s) =>
        `<span class="legend-item" style="background:${s.color};color:${s.textColor};">${s.code}</span> ${s.description}`
    )
    .join(" &nbsp;|&nbsp; ");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 10px; padding: 16px; color: #111; }
  h1 { font-size: 18px; color: #0F766E; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #64748B; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td {
    border: 1px solid #E2E8F0;
    text-align: center;
    padding: 3px 2px;
    font-size: 9px;
    overflow: hidden;
    white-space: nowrap;
  }
  th { background: #F1F5F9; font-weight: 700; font-size: 8px; }
  th.weekend { background: #EFF6FF; color: #2563EB; }
  td.staff-name {
    text-align: left;
    font-weight: 600;
    font-size: 9px;
    padding-left: 5px;
    width: 90px;
    white-space: normal;
    word-break: break-word;
  }
  td.total { font-weight: 700; background: #F8FAFC; color: #0F766E; }
  td.empty { background: #FAFAFA; }
  .legend { margin-top: 14px; font-size: 9px; color: #64748B; line-height: 1.8; }
  .legend-item {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 700;
    font-size: 8px;
  }
  .generated { margin-top: 10px; font-size: 8px; color: #94A3B8; }
</style>
</head>
<body>
  <h1>RotaManager — ${monthName} ${year}</h1>
  <p class="subtitle">Generated ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })} &nbsp;|&nbsp; ${staff.length} staff members</p>
  <table>
    <thead>
      <tr>
        <th style="width:90px;text-align:left;">Staff</th>
        ${dayHeaders}
        <th style="width:32px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="legend">
    <strong>Shift key:</strong> ${legend}
  </div>
  <p class="generated">RotaManager • Healthcare Staffing</p>
</body>
</html>`;
}

export async function exportRotaToPdf(
  year: number,
  month: number,
  staff: StaffMember[],
  shifts: ShiftEntry[]
): Promise<void> {
  if (staff.length === 0) {
    Alert.alert("No Staff", "Add staff members before exporting.");
    return;
  }

  try {
    const html = buildHtml(year, month, staff, shifts);

    if (Platform.OS === "web") {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
        w.print();
      }
      return;
    }

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Rota ${MONTH_NAMES[month - 1]} ${year}`,
        UTI: "com.adobe.pdf",
      });
    } else {
      await Print.printAsync({ uri });
    }
  } catch (err) {
    Alert.alert("Export Failed", "Could not generate the PDF. Please try again.");
  }
}
