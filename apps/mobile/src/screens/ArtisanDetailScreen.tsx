import React, { useEffect, useState } from "react";
import { Alert, Button, Text, View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiFetch } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

interface ArtisanDetail {
  id: string;
  displayName: string;
  bio: string;
  city: string;
  neighborhood: string;
  pricingNotes: string;
  isAvailableNow: boolean;
  ratingAvg: number;
  ratingCount: number;
  services: { service: { id: string; name: string } }[];
  reviews: { id: string; rating: number; comment: string }[];
}

const ArtisanDetailScreen: React.FC<NativeStackScreenProps<RootStackParamList, "ArtisanDetail">> = ({
  route,
  navigation,
}) => {
  const [artisan, setArtisan] = useState<ArtisanDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<ArtisanDetail>(`/artisans/${route.params.artisanId}`);
        setArtisan(data);
      } catch (error) {
        Alert.alert("Erreur", (error as Error).message);
      }
    };
    load();
  }, [route.params.artisanId]);

  if (!artisan) {
    return (
      <Screen>
        <Text>Chargement...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>{artisan.displayName}</Text>
        <Text style={styles.subtitle}>
          {artisan.city} • {artisan.neighborhood}
        </Text>
        <Text style={styles.bio}>{artisan.bio}</Text>
        <Text style={styles.highlight}>Prix: {artisan.pricingNotes}</Text>
        <Text>
          Note: {artisan.ratingAvg.toFixed(1)} ({artisan.ratingCount} avis)
        </Text>
        <Text style={styles.available}>
          {artisan.isAvailableNow ? "Disponible maintenant" : "Sur rendez-vous"}
        </Text>
        <View style={styles.services}>
          {artisan.services.map((service) => (
            <Text key={service.service.id} style={styles.tag}>
              {service.service.name}
            </Text>
          ))}
        </View>
        <Button
          title="Envoyer une demande"
          onPress={() =>
            navigation.navigate("RequestForm", {
              artisanId: artisan.id,
              serviceId: artisan.services[0]?.service.id,
            })
          }
          color={theme.colors.primary}
        />
      </Card>
      <View style={styles.reviews}>
        <Text style={styles.sectionTitle}>Avis récents</Text>
        {artisan.reviews.length === 0 ? (
          <Text style={styles.empty}>Aucun avis pour le moment.</Text>
        ) : (
          artisan.reviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
              <Text>{review.comment}</Text>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.text },
  subtitle: { color: theme.colors.textMuted },
  sectionTitle: { fontWeight: "600", color: theme.colors.text },
  highlight: { fontWeight: "600", color: theme.colors.text },
  bio: { color: theme.colors.textMuted, marginBottom: 6 },
  available: { color: theme.colors.success, fontWeight: "600" },
  services: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 8 },
  tag: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  reviews: { gap: 8, marginTop: 8 },
  reviewCard: { gap: 6 },
  reviewRating: { fontWeight: "600", color: theme.colors.warning },
  empty: { color: theme.colors.textMuted },
});

export default ArtisanDetailScreen;
