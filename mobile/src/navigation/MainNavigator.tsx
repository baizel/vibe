import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ProductsScreen from "../screens/ProductsScreen";
import CartScreen from "../screens/CartScreen";
// import OrdersScreen from "../screens/OrdersScreen";
// import ProfileScreen from "../screens/ProfileScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
// import OrderTrackingScreen from "../screens/OrderTrackingScreen";
// import DriverDashboard from "../screens/driver/DriverDashboard";
// import DriverRouteScreen from "../screens/driver/DriverRouteScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CustomerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case "Home":
            iconName = focused ? "home" : "home-outline";
            break;
          case "Products":
            iconName = focused ? "grid" : "grid-outline";
            break;
          case "Cart":
            iconName = focused ? "basket" : "basket-outline";
            break;
          case "Orders":
            iconName = focused ? "receipt" : "receipt-outline";
            break;
          case "Profile":
            iconName = focused ? "person" : "person-outline";
            break;
          default:
            iconName = "help-outline";
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#2ECC71",
      tabBarInactiveTintColor: "gray",
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Products" component={ProductsScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    {/* <Tab.Screen name="Orders" component={OrdersScreen} /> */}
    {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
  </Tab.Navigator>
);

const DriverTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case "Dashboard":
            iconName = focused ? "speedometer" : "speedometer-outline";
            break;
          case "Routes":
            iconName = focused ? "map" : "map-outline";
            break;
          case "Profile":
            iconName = focused ? "person" : "person-outline";
            break;
          default:
            iconName = "help-outline";
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#3498DB",
      tabBarInactiveTintColor: "gray",
    })}
  >
    {/* <Tab.Screen name="Dashboard" component={DriverDashboard} /> */}
    {/* <Tab.Screen name="Routes" component={DriverRouteScreen} /> */}
    <Tab.Screen name="Profile" component={HomeScreen} />
  </Tab.Navigator>
);

export default function MainNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user?.role === "driver" ? (
        <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          {/* <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} /> */}
        </>
      )}
    </Stack.Navigator>
  );
}
