import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface HourProgressProps {
  worked: number;
  contracted: number;
  showLabel?: boolean;
}

export function HourProgress({
  worked,
  contracted,
  showLabel = true,
}: HourProgressProps) {
  const colors = useColors();
  const pct = contracted > 0 ? Math.min(worked / contracted, 1) : 0;
  const over = worked > contracted;

  const barColor = over
    ? colors.destructive
    : pct > 0.85
      ? colors.warning
      : colors.primary;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labels}>
          <Text style={[styles.hoursText, { color: colors.foreground }]}>
            {worked}h
          </Text>
          <Text style={[styles.contractedText, { color: colors.mutedForeground }]}>
            / {contracted}h
          </Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct * 100}%`,
              backgroundColor: barColor,
              borderRadius: 4,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  labels: { flexDirection: "row", alignItems: "baseline" },
  hoursText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  contractedText: { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 2 },
  track: { height: 4, borderRadius: 4, overflow: "hidden" },
  fill: { height: 4 },
});
