import React, { useEffect, useState } from "react";
import { Alert, Button, Text, TextInput, View, StyleSheet, ScrollView } from "react-native";
import { apiFetch } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  categoryId: string;
}

interface ArtisanProfile {
  id: string;
  displayName: string;
  bio: string;
  categoryId: string;
  city: string;
  neighborhood: string;
  serviceAreas: string[];
  pricingNotes: string;
  isAvailableNow: boolean;
  phone: string;
  services: { service: Service }[];
}

const ArtisanProfileScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [pricingNotes, setPricingNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [isAvailableNow, setIsAvailableNow] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [categoryData, serviceData] = await Promise.all([
          apiFetch<Category[]>("/catalog/categories"),
          apiFetch<Service[]>("/catalog/services"),
        ]);
        setCategories(categoryData);
        setServices(serviceData);

        try {
          const existing = await apiFetch<ArtisanProfile>("/artisans/me/profile");
          setProfile(existing);
          setDisplayName(existing.displayName);
          setBio(existing.bio);
          setCategoryId(existing.categoryId);
          setCity(existing.city);
          setNeighborhood(existing.neighborhood);
          setServiceAreas(existing.serviceAreas.join(", "));
          setPricingNotes(existing.pricingNotes);
          setPhone(existing.phone);
          setIsAvailableNow(existing.isAvailableNow);
          setSelectedServices(existing.services.map((item) => item.service.id));
        } catch {
          setProfile(null);
        }
      } catch (error) {
        Alert.alert("Erreur", (error as Error).message);
      }
    };
    load();
  }, []);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      const payload = {
        displayName,
        bio,
        categoryId,
        serviceIds: selectedServices,
        city,
        neighborhood,
        serviceAreas: serviceAreas.split(",").map((item) => item.trim()).filter(Boolean),
        pricingNotes,
        isAvailableNow,
        phone,
      };
      if (profile) {
        await apiFetch("/artisans/me/profile", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/artisans/me/profile", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      Alert.alert("Succès", "Profil enregistré.");
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Mon profil artisan</Text>
      <Card>
        <TextInput
          placeholder="Nom affiché"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
        />
        <TextInput placeholder="Bio" value={bio} onChangeText={setBio} style={styles.input} multiline />
        <Text style={styles.label}>Catégorie</Text>
        <ScrollView horizontal contentContainerStyle={styles.row}>
          {categories.map((category) => (
            <Button
              key={category.id}
              title={category.name}
              onPress={() => setCategoryId(category.id)}
              color={categoryId === category.id ? theme.colors.primary : theme.colors.textMuted}
            />
          ))}
        </ScrollView>
        <Text style={styles.label}>Services</Text>
        <View style={styles.rowWrap}>
          {services.map((service) => (
            <Button
              key={service.id}
              title={service.name}
              onPress={() => toggleService(service.id)}
              color={selectedServices.includes(service.id) ? theme.colors.success : theme.colors.textMuted}
            />
          ))}
        </View>
        <TextInput placeholder="Ville" value={city} onChangeText={setCity} style={styles.input} />
        <TextInput
          placeholder="Quartier"
          value={neighborhood}
          onChangeText={setNeighborhood}
          style={styles.input}
        />
        <TextInput
          placeholder="Zones desservies (séparées par des virgules)"
          value={serviceAreas}
          onChangeText={setServiceAreas}
          style={styles.input}
        />
        <TextInput
          placeholder="Notes tarifaires"
          value={pricingNotes}
          onChangeText={setPricingNotes}
          style={styles.input}
        />
        <TextInput
          placeholder="Téléphone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
        <Button
          title={isAvailableNow ? "Disponible maintenant ✔" : "Disponible maintenant"}
          onPress={() => setIsAvailableNow((prev) => !prev)}
          color={isAvailableNow ? theme.colors.success : theme.colors.textMuted}
        />
        <Button title="Enregistrer" onPress={handleSave} color={theme.colors.primary} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  label: { fontWeight: "600", marginTop: 8, color: theme.colors.text },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: { gap: 8, paddingVertical: 6 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

export default ArtisanProfileScreen;
