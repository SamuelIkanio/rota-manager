import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { HourProgress } from "@/components/HourProgress";
import { StaffAvatar } from "@/components/StaffAvatar";
import { StaffMember, useRota } from "@/context/RotaContext";
import { useColors } from "@/hooks/useColors";

function StaffCard({ member }: { member: StaffMember }) {
  const colors = useColors();
  const { getHoursWorked } = useRota();
  const now = new Date();
  const hoursWorked = getHoursWorked(member.id, now.getFullYear(), now.getMonth() + 1);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/staff/${member.id}`)}
      activeOpacity={0.8}
    >
      <StaffAvatar name={member.name} size={44} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: colors.foreground }]}>
          {member.name}
        </Text>
        <Text style={[styles.cardRole, { color: colors.mutedForeground }]}>
          {member.role} · {member.team}
        </Text>
        <View style={styles.progressWrap}>
          <HourProgress
            worked={hoursWorked}
            contracted={member.contractedHours}
          />
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function StaffScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { staff } = useRota();

  const now = new Date();
  const monthName = now.toLocaleString("en-GB", { month: "long", year: "numeric" });

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

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
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Staff
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {staff.length} member{staff.length !== 1 ? "s" : ""} · {monthName}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/staff/add")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {staff.length === 0 ? (
        <EmptyState
          icon="users"
          title="No staff yet"
          subtitle="Add your support workers to start building the rota"
          actionLabel="Add First Staff Member"
          onAction={() => router.push("/staff/add")}
        />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <StaffCard member={item} />}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                Platform.OS === "web" ? 100 : 80 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cardRole: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  progressWrap: {
    marginTop: 4,
  },
});
