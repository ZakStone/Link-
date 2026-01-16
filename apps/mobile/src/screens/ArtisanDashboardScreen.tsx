import React, { useEffect, useState } from "react";
import { Alert, Button, Text, View, StyleSheet } from "react-native";
import { apiFetch } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

interface RequestItem {
  id: string;
  status: string;
  createdAt: string;
  client: { phone: string };
  service: { name: string };
  detailsText: string;
}

const ArtisanDashboardScreen: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);

  const load = async () => {
    try {
      const data = await apiFetch<RequestItem[]>("/requests/assigned");
      setRequests(data);
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Demandes reçues</Text>
      {requests.map((request) => (
        <Card key={request.id} style={styles.card}>
          <Text style={styles.cardTitle}>{request.service.name}</Text>
          <Text style={styles.cardSubtitle}>Client: {request.client.phone}</Text>
          <Text style={styles.cardSubtitle}>Statut: {request.status}</Text>
          <Text style={styles.cardSubtitle}>Détails: {request.detailsText}</Text>
          <View style={styles.actions}>
            {request.status === "PENDING" && (
              <>
                <Button
                  title="Accepter"
                  onPress={() => updateStatus(request.id, "ACCEPTED")}
                  color={theme.colors.success}
                />
                <Button
                  title="Refuser"
                  color={theme.colors.danger}
                  onPress={() => updateStatus(request.id, "REJECTED")}
                />
              </>
            )}
            {request.status === "ACCEPTED" && (
              <Button
                title="Terminer"
                color={theme.colors.success}
                onPress={() => updateStatus(request.id, "COMPLETED")}
              />
            )}
          </View>
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.text },
  card: { gap: 6 },
  cardTitle: { fontWeight: "600", color: theme.colors.text },
  cardSubtitle: { color: theme.colors.textMuted },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});

export default ArtisanDashboardScreen;
