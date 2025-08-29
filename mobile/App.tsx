// App.tsx - Main App Entry Point
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { AuthProvider } from "./src/context/AuthContext";
// import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";
import { useAuth } from "./src/context/AuthContext";
// import LoadingScreen from "./src/screens/LoadingScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  //   if (isLoading) {
  //     return <LoadingScreen />;
  //   }

  return <NavigationContainer>{<MainNavigator />}</NavigationContainer>;
};

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </Provider>
  );
}
