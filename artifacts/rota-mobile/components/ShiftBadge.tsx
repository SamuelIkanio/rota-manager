import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SHIFT_TYPES, ShiftCode } from "@/constants/shiftTypes";

interface ShiftBadgeProps {
  code: ShiftCode;
  compact?: boolean;
  large?: boolean;
}

export function ShiftBadge({
  code,
  compact = false,
  large = false,
}: ShiftBadgeProps) {
  const shift = SHIFT_TYPES[code];
  if (!shift) return null;

  if (compact) {
    return (
      <View
        style={[styles.compact, { backgroundColor: shift.color }]}
      >
        <Text style={[styles.compactText, { color: shift.textColor }]}>
          {code === "OFF" ? "·" : code === "DS" ? "DS" : code}
        </Text>
      </View>
    );
  }

  if (large) {
    return (
      <View style={[styles.large, { backgroundColor: shift.color }]}>
        <Text style={[styles.largeCode, { color: shift.textColor }]}>
          {code}
        </Text>
        <Text style={[styles.largeDesc, { color: shift.textColor }]}>
          {shift.description}
        </Text>
        {shift.startTime && (
          <Text style={[styles.largeTime, { color: shift.textColor }]}>
            {shift.startTime} – {shift.endTime}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.normal, { backgroundColor: shift.color }]}>
      <Text style={[styles.normalCode, { color: shift.textColor }]}>
        {code}
      </Text>
      <Text style={[styles.normalDesc, { color: shift.textColor }]}>
        {shift.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    width: 32,
    height: 28,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  compactText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  normal: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  normalCode: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  normalDesc: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
    opacity: 0.85,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  largeCode: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  largeDesc: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    opacity: 0.9,
  },
  largeTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    opacity: 0.8,
  },
});
