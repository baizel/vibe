// App.tsx - Main App Entry Point with Material Paper UI
import React, { useEffect } from "react";
import app from "./src/config/firebase";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { Platform } from "react-native";
import { store } from "./src/store/store";
import { AuthProvider } from "./src/context/AuthContext";
import MainNavigator from "./src/navigation/MainNavigator";
import LoadingScreen from "./src/screens/LoadingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { useAuth } from "./src/context/AuthContext";
import { useCartPersistence } from "./src/hooks/useCartPersistence";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2ECC71",
    primaryContainer: "#E8F5E8",
    secondary: "#34495E",
    secondaryContainer: "#ECF0F1",
    background: "#f5f5f5",
    surface: "#ffffff",
    surfaceVariant: "#f8f9fa",
    error: "#E74C3C",
  },
};
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const { isLoaded: isCartLoaded } = useCartPersistence();
  console.log(app.name);

  if (isLoading || !isCartLoaded) {
    return <LoadingScreen />;
  }

  // Always show the main app - authentication only required at checkout
  return (
    <NavigationContainer
      linking={{
        prefixes: ["http://localhost:8084"],
        config: {
          screens: {
            CustomerTabs: {
              screens: {
                Home: "home",
                Products: "products",
                Cart: "cart",
                Orders: "orders",
                Profile: "profile",
                Admin: "admin",
              },
            },
            ProductDetail: {
              path: "product/:productId",
              parse: {
                productId: (productId: string) => productId,
              },
              // Only include productId in URL, ignore other params
              exact: true,
            },
            Checkout: "checkout",
            Login: "login",
          },
        },
      }}
    >
      <MainNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  // Gentle scroll fix that doesn't break layout
  useEffect(() => {
    if (Platform.OS === "web") {
      const gentleScrollFix = () => {
        if (typeof document !== "undefined") {
          // Only fix overflow, don't touch height or position
          const currentBodyOverflow = getComputedStyle(document.body).overflow;
          const currentHtmlOverflow = getComputedStyle(
            document.documentElement
          ).overflow;

          if (currentBodyOverflow === "hidden") {
            document.body.style.overflow = "auto";
            console.log("Fixed body overflow from hidden to auto");
          }

          if (currentHtmlOverflow === "hidden") {
            document.documentElement.style.overflow = "auto";
            console.log("Fixed html overflow from hidden to auto");
          }
        }
      };

      // Apply gently after React Native Web has initialized
      setTimeout(gentleScrollFix, 1000);
    }
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Provider store={store}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </Provider>
    </PaperProvider>
  );
}
