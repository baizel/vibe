// src/screens/HomeScreen.tsx - Customer Home Screen
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  unit: string;
}

const HomeScreen: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const products = await productAPI.getProducts();
      setFeaturedProducts(products.slice(0, 4)); // Show first 4 as featured
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeaturedProducts();
  };

  const navigateToProducts = (category?: string) => {
    navigation.navigate("Products", { category });
  };

  const navigateToProduct = (product: Product) => {
    navigation.navigate("ProductDetail", { product });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
            <Text style={styles.subtitle}>
              Fresh meat delivered to your door
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#2ECC71" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigateToProducts("beef")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#FFE5E5" }]}
              >
                <Text style={styles.categoryEmoji}>🥩</Text>
              </View>
              <Text style={styles.categoryText}>Beef</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigateToProducts("chicken")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#FFF4E5" }]}
              >
                <Text style={styles.categoryEmoji}>🐔</Text>
              </View>
              <Text style={styles.categoryText}>Chicken</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigateToProducts("pork")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#F0E5FF" }]}
              >
                <Text style={styles.categoryEmoji}>🐷</Text>
              </View>
              <Text style={styles.categoryText}>Pork</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigateToProducts("seafood")}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: "#E5F4FF" }]}
              >
                <Text style={styles.categoryEmoji}>🐟</Text>
              </View>
              <Text style={styles.categoryText}>Seafood</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigateToProducts()}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigateToProduct(product)}
              >
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    £{product.price.toFixed(2)}/{product.unit}
                  </Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate("Orders")}
            >
              <Ionicons name="receipt-outline" size={32} color="#2ECC71" />
              <Text style={styles.quickActionText}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate("Cart")}
            >
              <Ionicons name="basket-outline" size={32} color="#2ECC71" />
              <Text style={styles.quickActionText}>My Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigateToProducts()}
            >
              <Ionicons name="search-outline" size={32} color="#2ECC71" />
              <Text style={styles.quickActionText}>Browse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Common Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    color: "#2ECC71",
    fontSize: 16,
    fontWeight: "500",
  },
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2ECC71",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    marginHorizontal: 5,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  // Products Screen Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    marginRight: 10,
  },
  categoryFilterButtonActive: {
    backgroundColor: "#2ECC71",
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryFilterTextActive: {
    color: "white",
  },
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Product Detail Screen Styles
  content: {
    flex: 1,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 15,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2ECC71",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 15,
    marginTop: 15,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2ECC71",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  addToCartButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export { HomeScreen };
