import React, { useEffect, useState } from "react";
import { Alert, Button, Text, View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiFetch, getStoredRole } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

interface Category {
  id: string;
  name: string;
  services: { id: string; name: string }[];
}

const CategoriesScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Categories">> = ({
  navigation,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<Category[]>("/catalog/categories");
        setCategories(data);
        const stored = await getStoredRole();
        setRole(stored);
      } catch (error) {
        Alert.alert("Erreur", (error as Error).message);
      }
    };
    load();
  }, []);

  return (
    <Screen>
      <Card style={styles.hero}>
        <Text style={styles.title}>Trouver un artisan</Text>
        <Text style={styles.subtitle}>
          Des professionnels vérifiés pour la maison, la beauté et la mobilité.
        </Text>
      </Card>
      <Text style={styles.sectionTitle}>Catégories</Text>
      {categories.map((category) => (
        <Card key={category.id} style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Service local</Text>
          </View>
          <Text style={styles.cardTitle}>{category.name}</Text>
          <Text style={styles.cardSubtitle}>{category.services.map((s) => s.name).join(", ")}</Text>
          <Button
            title="Voir les artisans"
            onPress={() =>
              navigation.navigate("ArtisanList", {
                categoryId: category.id,
                categoryName: category.name,
              })
            }
          />
        </Card>
      ))}
      <View style={styles.actions}>
        {role === "CLIENT" ? (
          <Button title="Mes demandes" onPress={() => navigation.navigate("ClientRequests")} />
        ) : null}
        {role === "ARTISAN" ? (
          <>
            <Button
              title="Demandes reçues"
              onPress={() => navigation.navigate("ArtisanDashboard")}
            />
            <Button
              title="Mon profil artisan"
              onPress={() => navigation.navigate("ArtisanProfile")}
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: theme.colors.text },
  subtitle: { color: theme.colors.textMuted },
  sectionTitle: { fontWeight: "600", fontSize: 18 },
  card: {
    gap: 8,
  },
  hero: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primarySoft,
  },
  cardTitle: { fontWeight: "600", fontSize: 18, color: theme.colors.text },
  cardSubtitle: { color: theme.colors.textMuted },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actions: { marginTop: 16, gap: 8 },
});

export default CategoriesScreen;
