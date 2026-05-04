import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ShiftBadge } from "@/components/ShiftBadge";
import { StaffAvatar } from "@/components/StaffAvatar";
import { HourProgress } from "@/components/HourProgress";
import { SHIFT_TYPES } from "@/constants/shiftTypes";
import { useRota } from "@/context/RotaContext";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/components/WeekGrid";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function StaffDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { staff, deleteStaff, getShiftsForStaff, getHoursWorked } = useRota();

  const member = staff.find((s) => s.id === id);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  const monthShifts = useMemo(
    () => getShiftsForStaff(id ?? "", viewYear, viewMonth),
    [id, viewYear, viewMonth, getShiftsForStaff]
  );

  const hoursWorked = useMemo(
    () => getHoursWorked(id ?? "", viewYear, viewMonth),
    [id, viewYear, viewMonth, getHoursWorked]
  );

  const shiftMap = useMemo(() => {
    const m: Record<string, (typeof monthShifts)[0]> = {};
    for (const s of monthShifts) m[s.date] = s;
    return m;
  }, [monthShifts]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  const alCount = monthShifts.filter((s) => s.shiftType === "AL").length;
  const nightCount = monthShifts.filter((s) => s.shiftType === "N").length;

  function handleDelete() {
    Alert.alert(
      "Remove Staff",
      `Remove ${member?.name} from the rota? This will also clear all their shifts.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            deleteStaff(id ?? "");
            router.back();
          },
        },
      ]
    );
  }

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  if (!member) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>
          Staff member not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <StaffAvatar name={member.name} size={56} />
        <View style={styles.profileInfo}>
          <Text style={[styles.memberName, { color: colors.foreground }]}>
            {member.name}
          </Text>
          <Text style={[styles.memberRole, { color: colors.mutedForeground }]}>
            {member.role} · {member.team}
          </Text>
          <Text style={[styles.memberContract, { color: colors.mutedForeground }]}>
            {member.contractedHours}h contracted / month
          </Text>
        </View>
        <View style={styles.profileActions}>
          <TouchableOpacity
            onPress={() => router.push(`/staff/add?edit=${member.id}`)}
            style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="edit-2" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.iconBtn, { backgroundColor: "#FEE2E2" }]}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Month selector */}
      <View style={[styles.monthNav, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Feather name="chevron-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.foreground }]}>
          {MONTHS[viewMonth - 1]} {viewYear}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Feather name="chevron-right" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Hours summary */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {hoursWorked}h
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Worked
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {member.contractedHours}h
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Contracted
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success ?? "#059669" }]}>
            {alCount}d
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Ann. Leave
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: SHIFT_TYPES.N.color }]}>
            {nightCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Nights
          </Text>
        </View>
      </View>

      <HourProgress
        worked={hoursWorked}
        contracted={member.contractedHours}
        showLabel={false}
      />

      {/* Calendar grid */}
      <View style={[styles.calSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.calTitle, { color: colors.mutedForeground }]}>
          SHIFT CALENDAR
        </Text>
        <View style={styles.calGrid}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const shift = shiftMap[dateStr];
            const today = formatDate(new Date());
            const isToday = dateStr === today;
            const dow = new Date(viewYear, viewMonth - 1, dayNum).getDay();
            const isWeekend = dow === 0 || dow === 6;

            return (
              <TouchableOpacity
                key={dayNum}
                style={[
                  styles.calCell,
                  isToday && {
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                    borderRadius: 8,
                  },
                ]}
                onPress={() => router.push(`/shift/${member.id}/${dateStr}`)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.calDayNum,
                    {
                      color: isToday
                        ? colors.primary
                        : isWeekend
                          ? colors.mutedForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {dayNum}
                </Text>
                {shift ? (
                  <ShiftBadge code={shift.shiftType} compact />
                ) : (
                  <View
                    style={[
                      styles.emptyCalCell,
                      { borderColor: colors.border },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 15 },
  profileCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  profileInfo: { flex: 1, gap: 3 },
  memberName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  memberRole: { fontSize: 13, fontFamily: "Inter_400Regular" },
  memberContract: { fontSize: 12, fontFamily: "Inter_400Regular" },
  profileActions: { gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  monthTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  statsRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statDivider: { width: StyleSheet.hairlineWidth },
  calSection: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  calTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  calCell: {
    width: "13%",
    alignItems: "center",
    paddingVertical: 4,
    gap: 3,
  },
  calDayNum: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  emptyCalCell: {
    width: 28,
    height: 24,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
