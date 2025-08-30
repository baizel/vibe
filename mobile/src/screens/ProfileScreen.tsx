// src/screens/ProfileScreen.tsx - Profile Screen (Placeholder)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const menuItems = [
    {
      id: "1",
      title: "Edit Profile",
      icon: "person-outline",
      action: () =>
        Alert.alert("Coming Soon", "Edit Profile feature coming soon!"),
    },
    {
      id: "2",
      title: "My Addresses",
      icon: "location-outline",
      action: () =>
        Alert.alert("Coming Soon", "Address management coming soon!"),
    },
    {
      id: "3",
      title: "Payment Methods",
      icon: "card-outline",
      action: () => Alert.alert("Coming Soon", "Payment methods coming soon!"),
    },
    {
      id: "4",
      title: "Order History",
      icon: "time-outline",
      action: () => Alert.alert("Coming Soon", "Order history coming soon!"),
    },
    {
      id: "5",
      title: "Notifications",
      icon: "notifications-outline",
      action: () =>
        Alert.alert("Coming Soon", "Notification settings coming soon!"),
    },
    {
      id: "6",
      title: "Help & Support",
      icon: "help-circle-outline",
      action: () => Alert.alert("Coming Soon", "Help & Support coming soon!"),
    },
    {
      id: "7",
      title: "About",
      icon: "information-circle-outline",
      action: () => Alert.alert("About", "FreshTrio Meat Delivery App v1.0.0"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="#2ECC71" />
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
            >
              <Ionicons name={item.icon as any} size={24} color="#666" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8F9FA",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  logoutText: {
    fontSize: 16,
    color: "#E74C3C",
    marginLeft: 16,
    fontWeight: "500",
  },
});

export default ProfileScreen;
