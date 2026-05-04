import React from "react";
import { StyleSheet, Text, View } from "react-native";

const COLORS = [
  "#0F766E",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#D97706",
  "#059669",
  "#EA580C",
  "#0891B2",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface StaffAvatarProps {
  name: string;
  size?: number;
}

export function StaffAvatar({ name, size = 40 }: StaffAvatarProps) {
  const bg = getColor(name);
  const initials = getInitials(name);
  const fontSize = size * 0.38;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: "#FFFFFF" }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
