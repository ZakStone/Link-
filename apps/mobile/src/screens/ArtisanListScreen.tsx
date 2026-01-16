import React, { useEffect, useState } from "react";
import { Alert, Button, Text, TextInput, View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiFetch } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

interface Artisan {
  id: string;
  displayName: string;
  city: string;
  neighborhood: string;
  ratingAvg: number;
  isAvailableNow: boolean;
  services: { service: { id: string; name: string } }[];
}

const ArtisanListScreen: React.FC<NativeStackScreenProps<RootStackParamList, "ArtisanList">> = ({
  navigation,
  route,
}) => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [minRating, setMinRating] = useState("");
  const [availableNow, setAvailableNow] = useState(false);

  const loadArtisans = async () => {
    try {
      const params: string[] = [];
      if (route.params?.categoryId) params.push(`categoryId=${encodeURIComponent(route.params.categoryId)}`);
      if (city) params.push(`city=${encodeURIComponent(city)}`);
      if (neighborhood) params.push(`neighborhood=${encodeURIComponent(neighborhood)}`);
      if (minRating) params.push(`minRating=${encodeURIComponent(minRating)}`);
      if (availableNow) params.push(`availableNow=true`);

      const query = params.length ? `?${params.join("&")}` : "";
      const data = await apiFetch<Artisan[]>(`/artisans${query}`);
      setArtisans(data);
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  useEffect(() => {
    loadArtisans();
  }, []);

  return (
    <Screen>
      <Text style={styles.title}>Artisans {route.params?.categoryName ?? ""}</Text>
      <Card style={styles.filters}>
        <Text style={styles.sectionTitle}>Filtrer</Text>
        <TextInput placeholder="Ville" value={city} onChangeText={setCity} style={styles.input} />
        <TextInput
          placeholder="Quartier"
          value={neighborhood}
          onChangeText={setNeighborhood}
          style={styles.input}
        />
        <TextInput
          placeholder="Note min (ex: 4)"
          value={minRating}
          onChangeText={setMinRating}
          style={styles.input}
          keyboardType="numeric"
        />
        <View style={styles.filterButtons}>
          <Button
            title={availableNow ? "Disponible maintenant ✔" : "Disponible maintenant"}
            onPress={() => setAvailableNow((prev) => !prev)}
            color={availableNow ? theme.colors.success : theme.colors.textMuted}
          />
          <Button title="Filtrer" onPress={loadArtisans} color={theme.colors.primary} />
        </View>
      </Card>
      {artisans.map((artisan) => (
        <Card key={artisan.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{artisan.displayName}</Text>
            <Text style={styles.rating}>⭐ {artisan.ratingAvg.toFixed(1)}</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {artisan.city} • {artisan.neighborhood}
          </Text>
          <Text style={styles.cardSubtitle}>
            Services: {artisan.services.map((s) => s.service.name).join(", ")}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.available}>
              {artisan.isAvailableNow ? "Disponible maintenant" : "Sur rendez-vous"}
            </Text>
            <Button
              title="Voir profil"
              onPress={() => navigation.navigate("ArtisanDetail", { artisanId: artisan.id })}
              color={theme.colors.primary}
            />
          </View>
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  sectionTitle: { fontWeight: "600", marginBottom: 8, color: theme.colors.text },
  filters: { gap: 8, marginBottom: 8 },
  filterButtons: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  card: { gap: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontWeight: "600", fontSize: 16, color: theme.colors.text },
  cardSubtitle: { color: theme.colors.textMuted },
  rating: { fontWeight: "600", color: theme.colors.warning },
  available: { color: theme.colors.textMuted },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});

export default ArtisanListScreen;
