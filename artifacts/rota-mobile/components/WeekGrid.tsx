import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SHIFT_TYPES } from "@/constants/shiftTypes";
import { useRota } from "@/context/RotaContext";
import { useColors } from "@/hooks/useColors";
import { ShiftBadge } from "./ShiftBadge";

const NAME_WIDTH = 100;
const DAY_WIDTH = 40;
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 54;
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

interface WeekGridProps {
  weekStart: Date;
}

export function WeekGrid({ weekStart }: WeekGridProps) {
  const colors = useColors();
  const { staff, shifts } = useRota();

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const todayStr = formatDate(new Date());

  const shiftMap = useMemo(() => {
    const m: Record<string, (typeof shifts)[0]> = {};
    for (const s of shifts) {
      m[`${s.staffId}-${s.date}`] = s;
    }
    return m;
  }, [shifts]);

  const coverage = useMemo(
    () =>
      days.map((day) => {
        const date = formatDate(day);
        const dayShifts = shifts.filter((s) => s.date === date);
        return {
          D: dayShifts.filter((s) => s.shiftType === "D").length,
          DS: dayShifts.filter((s) => s.shiftType === "DS").length,
          N: dayShifts.filter((s) => s.shiftType === "N").length,
        };
      }),
    [days, shifts]
  );

  if (staff.length === 0) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: colors.background }]}>
        <Feather name="users" size={36} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          No staff added yet
        </Text>
        <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
          Add your team members in the Staff tab
        </Text>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/staff/add")}
          activeOpacity={0.8}
        >
          <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
            Add Staff
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.headerRow,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={[styles.nameCol, { borderRightColor: colors.border }]}>
          <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>
            STAFF
          </Text>
        </View>
        {days.map((day, i) => {
          const dateStr = formatDate(day);
          const isToday = dateStr === todayStr;
          return (
            <View
              key={i}
              style={[
                styles.dayHeader,
                isToday && { backgroundColor: colors.primary, borderRadius: 8 },
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  { color: isToday ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {DAY_LABELS[i]}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  { color: isToday ? colors.primaryForeground : colors.foreground },
                ]}
              >
                {day.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Staff rows */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {staff.map((member, idx) => (
          <Pressable
            key={member.id}
            style={({ pressed }) => [
              styles.staffRow,
              {
                backgroundColor:
                  idx % 2 === 0 ? colors.background : colors.card,
                borderBottomColor: colors.border,
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.nameCol, { borderRightColor: colors.border }]}
              onPress={() => router.push(`/staff/${member.id}`)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.memberName, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {member.name.split(" ")[0]}
              </Text>
              <Text
                style={[styles.memberSurname, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {member.name.split(" ").slice(1).join(" ")}
              </Text>
            </TouchableOpacity>
            {days.map((day, di) => {
              const dateStr = formatDate(day);
              const shift = shiftMap[`${member.id}-${dateStr}`];
              return (
                <TouchableOpacity
                  key={di}
                  style={styles.cell}
                  onPress={() =>
                    router.push(`/shift/${member.id}/${dateStr}`)
                  }
                  activeOpacity={0.7}
                >
                  {shift && shift.shiftType !== "OFF" ? (
                    <ShiftBadge code={shift.shiftType} compact />
                  ) : (
                    <View
                      style={[
                        styles.emptyCell,
                        { borderColor: colors.border },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        ))}

        {/* Coverage row */}
        <View
          style={[
            styles.coverageRow,
            {
              backgroundColor: colors.secondary,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={[styles.nameCol, { borderRightColor: colors.border }]}>
            <Text
              style={[styles.coverLabel, { color: colors.mutedForeground }]}
            >
              Cover
            </Text>
          </View>
          {coverage.map((cov, i) => (
            <View key={i} style={[styles.cell, styles.coverCell]}>
              {cov.D > 0 && (
                <Text style={[styles.coverNum, { color: SHIFT_TYPES.D.color }]}>
                  {cov.D}D
                </Text>
              )}
              {cov.DS > 0 && (
                <Text style={[styles.coverNum, { color: SHIFT_TYPES.DS.color }]}>
                  {cov.DS}S
                </Text>
              )}
              {cov.N > 0 && (
                <Text style={[styles.coverNum, { color: SHIFT_TYPES.N.color }]}>
                  {cov.N}N
                </Text>
              )}
              {cov.D === 0 && cov.DS === 0 && cov.N === 0 && (
                <Text style={[styles.coverNum, { color: colors.mutedForeground }]}>
                  –
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  headerRow: {
    flexDirection: "row",
    height: HEADER_HEIGHT,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  dayHeader: {
    width: DAY_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  dayLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  dayNum: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  scroll: { flex: 1 },
  staffRow: {
    flexDirection: "row",
    height: ROW_HEIGHT,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nameCol: {
    width: NAME_WIDTH,
    paddingLeft: 14,
    paddingRight: 6,
    justifyContent: "center",
    borderRightWidth: StyleSheet.hairlineWidth,
    height: "100%",
  },
  memberName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  memberSurname: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  cell: {
    width: DAY_WIDTH,
    height: ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCell: {
    width: 28,
    height: 24,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  coverageRow: {
    flexDirection: "row",
    minHeight: 44,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  coverLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  coverCell: {
    flexDirection: "column",
    gap: 1,
  },
  coverNum: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    lineHeight: 12,
  },
});
