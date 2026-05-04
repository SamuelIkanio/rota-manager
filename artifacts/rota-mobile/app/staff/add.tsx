import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { StaffMember, useRota } from "@/context/RotaContext";
import { useColors } from "@/hooks/useColors";

const ROLES = [
  "Support Worker",
  "Senior Support Worker",
  "Team Leader",
  "Manager",
  "Bank Staff",
];

const HOURS_OPTIONS = [87, 130, 154, 174, 195, 217];

export default function AddStaffScreen() {
  const colors = useColors();
  const { addStaff, updateStaff, staff } = useRota();
  const params = useLocalSearchParams<{ edit?: string }>();

  const editId = params.edit;
  const existing = editId ? staff.find((s) => s.id === editId) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [role, setRole] = useState(existing?.role ?? ROLES[0]);
  const [team, setTeam] = useState(existing?.team ?? "SSW");
  const [contractedHours, setContractedHours] = useState(
    existing?.contractedHours ?? 174
  );

  function save() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter the staff member's name.");
      return;
    }
    const data: Omit<StaffMember, "id"> = {
      name: name.trim(),
      role,
      team: team.trim() || "SSW",
      contractedHours,
    };
    if (existing) {
      updateStaff({ ...data, id: existing.id });
    } else {
      addStaff(data);
    }
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            FULL NAME
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="e.g. Shannon Jackson"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Role */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            ROLE
          </Text>
          <View style={styles.chipRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      role === r ? colors.primary : colors.card,
                    borderColor: role === r ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setRole(r)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: role === r ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Team */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            TEAM
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="e.g. SSW, BH"
            placeholderTextColor={colors.mutedForeground}
            value={team}
            onChangeText={setTeam}
            autoCapitalize="characters"
          />
        </View>

        {/* Contracted hours */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            CONTRACTED HOURS / MONTH
          </Text>
          <View style={styles.chipRow}>
            {HOURS_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      contractedHours === h ? colors.primary : colors.card,
                    borderColor:
                      contractedHours === h ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setContractedHours(h)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        contractedHours === h
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
                marginTop: 8,
              },
            ]}
            placeholder="Or enter custom hours"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            value={
              HOURS_OPTIONS.includes(contractedHours)
                ? ""
                : contractedHours.toString()
            }
            onChangeText={(t) => {
              const n = parseInt(t, 10);
              if (!isNaN(n)) setContractedHours(n);
            }}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={save}
          activeOpacity={0.8}
        >
          <Feather name="check" size={18} color={colors.primaryForeground} />
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            {existing ? "Save Changes" : "Add Staff Member"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 24 },
  field: { gap: 10 },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
