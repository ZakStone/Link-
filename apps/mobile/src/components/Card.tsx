import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { theme } from "./theme";

export const Card: React.FC<ViewProps> = ({ style, ...props }) => (
  <View style={[styles.card, style]} {...props} />
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
