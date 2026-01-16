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
  artisan: { displayName: string };
  service: { name: string };
}

const ClientRequestsScreen: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);

  const load = async () => {
    try {
      const data = await apiFetch<RequestItem[]>("/requests/my");
      setRequests(data);
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancelRequest = async (id: string) => {
    try {
      await apiFetch(`/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      load();
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Historique des demandes</Text>
      {requests.map((request) => (
        <Card key={request.id} style={styles.card}>
          <Text style={styles.cardTitle}>{request.service.name}</Text>
          <Text style={styles.cardSubtitle}>{request.artisan.displayName}</Text>
          <Text style={styles.cardSubtitle}>Statut: {request.status}</Text>
          <Text style={styles.cardSubtitle}>{new Date(request.createdAt).toLocaleDateString()}</Text>
          {request.status === "PENDING" && (
            <Button
              title="Annuler"
              color={theme.colors.danger}
              onPress={() => cancelRequest(request.id)}
            />
          )}
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
});

export default ClientRequestsScreen;
