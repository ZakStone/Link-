import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiFetch, setTokens, setStoredRole } from "../api";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { theme } from "../components/theme";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: string; phone: string };
}

type Props = NativeStackScreenProps<RootStackParamList, "Login"> & {
  onLogin: (role: string) => void;
};

const LoginScreen: React.FC<Props> = ({ navigation, onLogin }) => {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phoneOrEmail, password }),
      });
      await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      await setStoredRole(data.user.role);
      onLogin(data.user.role);
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Link</Text>
        <Text style={styles.subtitle}>Accédez aux meilleurs artisans autour de vous.</Text>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>Connexion</Text>
        <TextInput
          placeholder="Téléphone ou email"
          value={phoneOrEmail}
          onChangeText={setPhoneOrEmail}
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
          title={loading ? "Connexion..." : "Se connecter"}
          onPress={handleLogin}
          color={theme.colors.primary}
        />
        <View style={styles.link}>
          <Text style={styles.muted}>Pas de compte ?</Text>
          <Button title="Créer un compte" onPress={() => navigation.navigate("Register")} />
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { gap: 6, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "700", color: theme.colors.text },
  subtitle: { color: theme.colors.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  link: { marginTop: 12, gap: 6 },
  muted: { color: theme.colors.textMuted },
});

export default LoginScreen;
