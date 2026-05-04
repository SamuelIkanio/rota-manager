import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ShiftBadge } from "@/components/ShiftBadge";
import { StaffAvatar } from "@/components/StaffAvatar";
import {
  SHIFT_CODES,
  SHIFT_TYPES,
  ShiftCode,
  getShiftHours,
} from "@/constants/shiftTypes";
import { useRota } from "@/context/RotaContext";
import { useColors } from "@/hooks/useColors";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES[date.getDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
}

export default function EditShiftScreen() {
  const colors = useColors();
  const { staffId, date } = useLocalSearchParams<{
    staffId: string;
    date: string;
  }>();
  const { staff, shifts, setShift, clearShift } = useRota();

  const member = staff.find((s) => s.id === staffId);
  const existing = shifts.find(
    (s) => s.staffId === staffId && s.date === date
  );

  const [selected, setSelected] = useState<ShiftCode | null>(
    existing?.shiftType ?? null
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");

  function save() {
    if (!staffId || !date) return;
    if (!selected || selected === "OFF") {
      clearShift(staffId, date);
    } else {
      setShift({
        staffId,
        date,
        shiftType: selected,
        hours: getShiftHours(selected),
        notes: notes.trim() || undefined,
      });
    }
    router.back();
  }

  function clear() {
    if (!staffId || !date) return;
    clearShift(staffId, date);
    router.back();
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Staff + date info */}
      {member && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <StaffAvatar name={member.name} size={40} />
          <View style={styles.infoText}>
            <Text style={[styles.staffName, { color: colors.foreground }]}>
              {member.name}
            </Text>
            <Text style={[styles.dateStr, { color: colors.mutedForeground }]}>
              {formatDisplayDate(date ?? "")}
            </Text>
          </View>
          {existing && (
            <TouchableOpacity onPress={clear} style={styles.clearBtn}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Current shift (if any) */}
      {selected && selected !== "OFF" && (
        <View style={[styles.currentShift, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.currentLabel, { color: colors.mutedForeground }]}>
            SELECTED
          </Text>
          <ShiftBadge code={selected} large />
        </View>
      )}

      {/* Shift picker */}
      <View style={[styles.pickerSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.pickerTitle, { color: colors.mutedForeground }]}>
          SELECT SHIFT TYPE
        </Text>
        <View style={styles.shiftGrid}>
          {SHIFT_CODES.map((code) => {
            const type = SHIFT_TYPES[code];
            const isSelected = selected === code;
            return (
              <TouchableOpacity
                key={code}
                style={[
                  styles.shiftOption,
                  {
                    backgroundColor: isSelected
                      ? type.color
                      : colors.secondary,
                    borderColor: isSelected ? type.color : colors.border,
                  },
                ]}
                onPress={() =>
                  setSelected(isSelected ? null : code)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.shiftCode,
                    { color: isSelected ? type.textColor : colors.foreground },
                  ]}
                >
                  {code}
                </Text>
                <Text
                  style={[
                    styles.shiftDesc,
                    {
                      color: isSelected
                        ? type.textColor
                        : colors.mutedForeground,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {type.description}
                </Text>
                {type.hours > 0 && (
                  <Text
                    style={[
                      styles.shiftHours,
                      {
                        color: isSelected
                          ? type.textColor
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {type.hours}h
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notes */}
      <View style={[styles.notesSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.pickerTitle, { color: colors.mutedForeground }]}>
          NOTES (OPTIONAL)
        </Text>
        <TextInput
          style={[
            styles.notesInput,
            { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
          ]}
          placeholder="Add a note..."
          placeholderTextColor={colors.mutedForeground}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: colors.foreground }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: selected ? colors.primary : colors.muted,
            },
          ]}
          onPress={save}
          activeOpacity={0.8}
        >
          <Feather
            name="check"
            size={16}
            color={selected ? colors.primaryForeground : colors.mutedForeground}
          />
          <Text
            style={[
              styles.saveText,
              {
                color: selected
                  ? colors.primaryForeground
                  : colors.mutedForeground,
              },
            ]}
          >
            {selected
              ? selected === "OFF"
                ? "Clear Shift"
                : "Save Shift"
              : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  infoText: { flex: 1 },
  staffName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  dateStr: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  clearBtn: { padding: 4 },
  currentShift: {
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  currentLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  pickerSection: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  pickerTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  shiftGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  shiftOption: {
    width: "47%",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 3,
  },
  shiftCode: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  shiftDesc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  shiftHours: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  notesSection: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
