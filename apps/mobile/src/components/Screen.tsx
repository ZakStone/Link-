import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { theme } from "./theme";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({ children, scroll = true }) => {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.safe, styles.container]}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: { paddingVertical: 16 },
  inner: { paddingHorizontal: 16, gap: 12 },
});
