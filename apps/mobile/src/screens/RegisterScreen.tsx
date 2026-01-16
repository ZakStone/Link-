import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiFetch } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

const RegisterScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Register">> = ({
  navigation,
}) => {
  const [role, setRole] = useState<"CLIENT" | "ARTISAN">("CLIENT");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ role, phone, email: email || null, password }),
      });
      Alert.alert("Succès", "Compte créé. Connectez-vous.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Choisissez votre profil pour continuer.</Text>
      <Card>
        <View style={styles.roleRow}>
          <Button
            title="Client"
            onPress={() => setRole("CLIENT")}
            color={role === "CLIENT" ? theme.colors.primary : theme.colors.textMuted}
          />
          <Button
            title="Artisan"
            onPress={() => setRole("ARTISAN")}
            color={role === "ARTISAN" ? theme.colors.primary : theme.colors.textMuted}
          />
        </View>
        <TextInput
          placeholder="Téléphone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <Button
          title={loading ? "Création..." : "Créer"}
          onPress={handleRegister}
          color={theme.colors.primary}
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: theme.colors.text },
  subtitle: { color: theme.colors.textMuted, marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default RegisterScreen;
