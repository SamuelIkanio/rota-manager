import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WeekGrid, formatDate, getWeekStart } from "@/components/WeekGrid";
import { useColors } from "@/hooks/useColors";

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString("en-GB", { day: "numeric" })} – ${end.toLocaleDateString("en-GB", opts)} ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)} ${end.getFullYear()}`;
}

export default function RotaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const todayWeekStart = getWeekStart(new Date());
  const isCurrentWeek = formatDate(weekStart) === formatDate(todayWeekStart);

  const prevWeek = useCallback(() => setWeekStart((w) => addWeeks(w, -1)), []);
  const nextWeek = useCallback(() => setWeekStart((w) => addWeeks(w, 1)), []);
  const goToday = useCallback(
    () => setWeekStart(getWeekStart(new Date())),
    []
  );

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        <View style={styles.headerTop}>
          <Text style={[styles.appTitle, { color: colors.primary }]}>
            RotaManager
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/staff/add")}
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.7}
          >
            <Feather name="user-plus" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.secondary }]}
            onPress={prevWeek}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={18} color={colors.foreground} />
          </TouchableOpacity>

          <Pressable onPress={goToday} style={styles.weekLabel}>
            <Text style={[styles.weekRange, { color: colors.foreground }]}>
              {formatWeekRange(weekStart)}
            </Text>
            {!isCurrentWeek && (
              <Text style={[styles.todayHint, { color: colors.primary }]}>
                Tap to go to today
              </Text>
            )}
          </Pressable>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.secondary }]}
            onPress={nextWeek}
            activeOpacity={0.7}
          >
            <Feather name="chevron-right" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <WeekGrid weekStart={weekStart} />

      {/* Bottom padding for tab bar */}
      <View
        style={{
          height: Platform.OS === "web" ? 84 : 80 + insets.bottom,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  appTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  weekLabel: {
    flex: 1,
    alignItems: "center",
  },
  weekRange: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  todayHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
