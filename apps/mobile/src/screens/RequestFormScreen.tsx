import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiFetch } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

const RequestFormScreen: React.FC<NativeStackScreenProps<RootStackParamList, "RequestForm">> = ({
  route,
  navigation,
}) => {
  const [serviceId, setServiceId] = useState(route.params.serviceId ?? "");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [addressText, setAddressText] = useState("");
  const [desiredAt, setDesiredAt] = useState("");
  const [detailsText, setDetailsText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await apiFetch("/requests", {
        method: "POST",
        body: JSON.stringify({
          artisanId: route.params.artisanId,
          serviceId,
          city,
          neighborhood,
          addressText,
          desiredAt,
          detailsText,
        }),
      });
      Alert.alert("Succès", "Demande envoyée.");
      navigation.navigate("ClientRequests");
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Nouvelle demande</Text>
      <Card>
        <TextInput
          placeholder="Service ID"
          value={serviceId}
          onChangeText={setServiceId}
          style={styles.input}
        />
        <TextInput placeholder="Ville" value={city} onChangeText={setCity} style={styles.input} />
        <TextInput
          placeholder="Quartier"
          value={neighborhood}
          onChangeText={setNeighborhood}
          style={styles.input}
        />
        <TextInput
          placeholder="Adresse complète"
          value={addressText}
          onChangeText={setAddressText}
          style={styles.input}
        />
        <TextInput
          placeholder="Date/heure souhaitée (YYYY-MM-DDTHH:mm:ssZ)"
          value={desiredAt}
          onChangeText={setDesiredAt}
          style={styles.input}
        />
        <TextInput
          placeholder="Détails"
          value={detailsText}
          onChangeText={setDetailsText}
          style={styles.input}
          multiline
        />
        <Button title={loading ? "Envoi..." : "Envoyer"} onPress={handleSubmit} color={theme.colors.primary} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default RequestFormScreen;
