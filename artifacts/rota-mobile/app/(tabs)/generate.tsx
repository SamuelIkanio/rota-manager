import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ShiftBadge } from "@/components/ShiftBadge";
import { StaffAvatar } from "@/components/StaffAvatar";
import { ShiftCode } from "@/constants/shiftTypes";
import { ShiftEntry, useRota } from "@/context/RotaContext";
import { useColors } from "@/hooks/useColors";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function CoverageCounter({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.counterRow}>
      <View style={[styles.counterDot, { backgroundColor: color }]} />
      <Text style={[styles.counterLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={[styles.counterBtn, { borderColor: colors.border }]}
          onPress={() => onChange(Math.max(0, value - 1))}
        >
          <Feather name="minus" size={14} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.counterVal, { color: colors.foreground }]}>
          {value}
        </Text>
        <TouchableOpacity
          style={[styles.counterBtn, { borderColor: colors.border }]}
          onPress={() => onChange(value + 1)}
        >
          <Feather name="plus" size={14} color={colors.foreground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface GeneratedShift {
  staffId: string;
  date: string;
  shiftType: string;
  hours: number;
}

interface GenerateResult {
  shifts: GeneratedShift[];
  summary: string;
  warnings?: string[];
}

export default function GenerateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { staff, applyGeneratedShifts, getShiftsForMonth } = useRota();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [minDay, setMinDay] = useState(2);
  const [minDS, setMinDS] = useState(2);
  const [minNight, setMinNight] = useState(2);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const selectedStaff = staff;

  async function generate() {
    if (selectedStaff.length === 0) {
      Alert.alert("No Staff", "Add staff members before generating a rota.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const existingShifts = getShiftsForMonth(year, month).map((s) => ({
        staffId: s.staffId,
        date: s.date,
        shiftType: s.shiftType,
      }));

      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const url = `https://${domain}/api/rota/generate`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          team: "SSW",
          staff: selectedStaff.map((s) => ({
            id: s.id,
            name: s.name,
            contractedHours: s.contractedHours,
            role: s.role,
          })),
          minDayCoverage: minDay,
          minDaySleepCoverage: minDS,
          minNightCoverage: minNight,
          notes,
          existingShifts,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate rota");
      }

      const data: GenerateResult = await res.json();
      setResult(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  function applyRota() {
    if (!result) return;
    const entries: Omit<ShiftEntry, "id">[] = result.shifts
      .filter((s) => s.shiftType !== "OFF")
      .map((s) => ({
        staffId: s.staffId,
        date: s.date,
        shiftType: s.shiftType as ShiftCode,
        hours: s.hours,
      }));
    applyGeneratedShifts(entries);
    Alert.alert(
      "Rota Applied",
      `${entries.length} shifts applied to ${MONTHS[month - 1]} ${year}.`,
      [{ text: "OK" }]
    );
    setResult(null);
  }

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          AI Generate
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Let AI build a fair rota for your team
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Platform.OS === "web" ? 100 : 80 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Month selector */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            MONTH
          </Text>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthBtn}>
              <Feather name="chevron-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: colors.foreground }]}>
              {MONTHS[month - 1]} {year}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthBtn}>
              <Feather name="chevron-right" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Staff count */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            STAFF INCLUDED
          </Text>
          <Text style={[styles.staffCount, { color: colors.foreground }]}>
            {staff.length === 0
              ? "No staff — add team members first"
              : `All ${staff.length} staff members`}
          </Text>
          {staff.slice(0, 4).map((s) => (
            <View key={s.id} style={styles.staffRow}>
              <StaffAvatar name={s.name} size={28} />
              <Text style={[styles.staffName, { color: colors.foreground }]}>
                {s.name}
              </Text>
              <Text style={[styles.staffHours, { color: colors.mutedForeground }]}>
                {s.contractedHours}h
              </Text>
            </View>
          ))}
          {staff.length > 4 && (
            <Text style={[styles.moreStaff, { color: colors.mutedForeground }]}>
              +{staff.length - 4} more
            </Text>
          )}
        </View>

        {/* Coverage requirements */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            MIN DAILY COVERAGE
          </Text>
          <CoverageCounter
            label="Day shifts (D)"
            color="#2563EB"
            value={minDay}
            onChange={setMinDay}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <CoverageCounter
            label="Day Sleep (DS)"
            color="#7C3AED"
            value={minDS}
            onChange={setMinDS}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <CoverageCounter
            label="Night shifts (N)"
            color="#1E3A5F"
            value={minNight}
            onChange={setMinNight}
          />
        </View>

        {/* Notes */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            NOTES & CONSTRAINTS
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="e.g. Sarah is unavailable Mondays, keep nights balanced..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Generate button */}
        <TouchableOpacity
          style={[
            styles.generateBtn,
            {
              backgroundColor:
                loading || staff.length === 0
                  ? colors.muted
                  : colors.primary,
            },
          ]}
          onPress={generate}
          disabled={loading || staff.length === 0}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="zap" size={18} color="#FFFFFF" />
              <Text style={styles.generateBtnText}>Generate Rota</Text>
            </>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            AI is building your rota... this may take a moment
          </Text>
        )}

        {/* Result */}
        {result && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Feather name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.resultTitle, { color: colors.foreground }]}>
                Rota Generated
              </Text>
            </View>
            <Text style={[styles.summary, { color: colors.mutedForeground }]}>
              {result.summary}
            </Text>

            {result.warnings && result.warnings.length > 0 && (
              <View style={[styles.warnings, { backgroundColor: "#FEF3C7", borderRadius: 8 }]}>
                {result.warnings.map((w, i) => (
                  <Text key={i} style={styles.warningText}>
                    ⚠ {w}
                  </Text>
                ))}
              </View>
            )}

            <Text style={[styles.shiftCount, { color: colors.mutedForeground }]}>
              {result.shifts.filter((s) => s.shiftType !== "OFF").length} shifts scheduled
            </Text>

            {/* Preview: show first few shifts */}
            {staff.map((member) => {
              const memberShifts = result.shifts
                .filter((s) => s.staffId === member.id && s.shiftType !== "OFF")
                .slice(0, 8);
              if (memberShifts.length === 0) return null;
              return (
                <View key={member.id} style={styles.previewRow}>
                  <StaffAvatar name={member.name} size={28} />
                  <Text style={[styles.previewName, { color: colors.foreground }]}>
                    {member.name.split(" ")[0]}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.previewBadges}>
                      {memberShifts.map((s, i) => (
                        <ShiftBadge
                          key={i}
                          code={s.shiftType as ShiftCode}
                          compact
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={applyRota}
              activeOpacity={0.8}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>Apply to Rota</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  content: { padding: 16, gap: 14 },
  section: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthBtn: { padding: 8 },
  monthLabel: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  staffCount: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  staffRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  staffName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  staffHours: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  moreStaff: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  counterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  counterLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counterVal: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    minWidth: 20,
    textAlign: "center",
  },
  divider: { height: StyleSheet.hairlineWidth },
  notesInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  resultCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  summary: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  warnings: {
    padding: 10,
    gap: 4,
  },
  warningText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#92400E",
  },
  shiftCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewName: {
    width: 60,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  previewBadges: {
    flexDirection: "row",
    gap: 4,
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  applyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
