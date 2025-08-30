import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Platform } from "react-native";
import { colors, commonStyles, webHeaderStyles } from "../styles/globalStyles";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ProductsScreen from "../screens/ProductsScreen";
import CartScreen from "../screens/CartScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import LoginScreen from "../screens/LoginScreen";

// Temporary placeholder components for Orders and Profile
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Web Header Component
const WebHeader = ({ navigation: navProp }: { navigation?: any }) => {
  const navigation = navProp || useNavigation<any>();
  const { user, isAuthenticated } = useAuth();

  if (Platform.OS !== 'web') return null;

  return (
    <View style={webHeaderStyles.webHeader}>
      <View style={webHeaderStyles.webHeaderContent}>
        {/* Logo/Brand */}
        <TouchableOpacity 
          style={webHeaderStyles.webLogo}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="storefront" size={28} color={colors.primary} />
          <Text style={webHeaderStyles.webLogoText}>FreshTrio</Text>
        </TouchableOpacity>

        {/* Navigation Links */}
        <View style={webHeaderStyles.webNav}>
          <TouchableOpacity 
            style={webHeaderStyles.webNavItem}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={webHeaderStyles.webNavText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={webHeaderStyles.webNavItem}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={webHeaderStyles.webNavText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={webHeaderStyles.webNavItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={webHeaderStyles.webNavText}>Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Right side - Cart & Profile */}
        <View style={webHeaderStyles.webActions}>
          <TouchableOpacity 
            style={webHeaderStyles.webActionItem}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="basket-outline" size={24} color={colors.dark} />
            <Text style={webHeaderStyles.webActionText}>Cart</Text>
          </TouchableOpacity>
          
          {isAuthenticated ? (
            <TouchableOpacity 
              style={webHeaderStyles.webActionItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person" size={24} color={colors.dark} />
              <Text style={webHeaderStyles.webActionText}>Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={webHeaderStyles.webLoginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={webHeaderStyles.webLoginText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// OrdersScreen - Simple coming soon screen
const OrdersScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerTitle}>My Orders</Text>
      </View>

      <View style={commonStyles.emptyState}>
        <Ionicons name="receipt-outline" size={80} color={colors.lightGray} />
        <Text style={commonStyles.emptyTitle}>Orders Coming Soon</Text>
        <Text style={commonStyles.emptySubtitle}>
          Order tracking and history features are currently in development.
        </Text>
        <TouchableOpacity
          style={commonStyles.primaryButton}
          onPress={() => navigation.navigate("Products")}
        >
          <Text style={commonStyles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ProfileScreen - Simple coming soon screen
const ProfileScreen = () => {
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.centerContent, { backgroundColor: colors.background }]}>
        <View style={[commonStyles.centered, { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E8', marginBottom: 16 }]}>
          <Ionicons name="person-outline" size={50} color={colors.lightGray} />
        </View>
        <Text style={commonStyles.title}>Profile Coming Soon</Text>
        <Text style={[commonStyles.bodyText, { textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 }]}>
          User profiles and account management features are currently in development.
        </Text>
        
        <TouchableOpacity style={[commonStyles.primaryButton, { flexDirection: 'row', alignItems: 'center' }]} onPress={handleLogin}>
          <Ionicons name="lock-closed" size={24} color={colors.white} />
          <Text style={[commonStyles.primaryButtonText, { marginLeft: 8 }]}>Login Coming Soon</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Mobile Tab Navigator
const CustomerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;
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
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray,
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Products" component={ProductsScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Web Stack Navigator with Header
const WebStackNavigator = () => {
  return (
    <View style={webHeaderStyles.webLayout}>
      <WebHeader />
      <View style={webHeaderStyles.webContent}>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="Home"
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </View>
    </View>
  );
};

const DriverTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;
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
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={HomeScreen} />
    <Tab.Screen name="Routes" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function MainNavigator() {
  const { user } = useAuth();

  if (user?.role === "driver") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
      </Stack.Navigator>
    );
  }

  if (Platform.OS === 'web') {
    // Web: Stack navigator with header, no tabs
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CustomerTabs" component={WebStackNavigator} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }}
        />
      </Stack.Navigator>
    );
  }

  // Mobile: Tab navigator at bottom
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
}

