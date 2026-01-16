import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Button, View } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import ArtisanListScreen from "./src/screens/ArtisanListScreen";
import ArtisanDetailScreen from "./src/screens/ArtisanDetailScreen";
import RequestFormScreen from "./src/screens/RequestFormScreen";
import ClientRequestsScreen from "./src/screens/ClientRequestsScreen";
import ArtisanDashboardScreen from "./src/screens/ArtisanDashboardScreen";
import ArtisanProfileScreen from "./src/screens/ArtisanProfileScreen";
import { clearTokens, getStoredRole, setStoredRole } from "./src/api";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Categories: undefined;
  ArtisanList: { categoryId?: string; categoryName?: string };
  ArtisanDetail: { artisanId: string };
  RequestForm: { artisanId: string; serviceId?: string };
  ClientRequests: undefined;
  ArtisanDashboard: undefined;
  ArtisanProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const loadRole = useCallback(async () => {
    const storedRole = await getStoredRole();
    setRole(storedRole);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  const handleLogout = async () => {
    await clearTokens();
    await setStoredRole("");
    setRole(null);
    await AsyncStorage.removeItem("role");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!role ? (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={(nextRole) => {
                    setRole(nextRole);
                    setStoredRole(nextRole);
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Categories"
              component={CategoriesScreen}
              options={{
                title: "Catégories",
                headerRight: () => (
                  <Button
                    title="Déconnexion"
                    onPress={handleLogout}
                    color="#d14343"
                  />
                ),
              }}
            />
            <Stack.Screen name="ArtisanList" component={ArtisanListScreen} />
            <Stack.Screen name="ArtisanDetail" component={ArtisanDetailScreen} />
            <Stack.Screen name="RequestForm" component={RequestFormScreen} />
            <Stack.Screen
              name="ClientRequests"
              component={ClientRequestsScreen}
              options={{ title: "Mes demandes" }}
            />
            <Stack.Screen
              name="ArtisanDashboard"
              component={ArtisanDashboardScreen}
              options={{ title: "Demandes reçues" }}
            />
            <Stack.Screen
              name="ArtisanProfile"
              component={ArtisanProfileScreen}
              options={{ title: "Profil artisan" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
