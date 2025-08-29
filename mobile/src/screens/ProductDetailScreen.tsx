// src/screens/ProductDetailScreen.tsx - Single Product View
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";

const ProductDetailScreen: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { product } = route.params;

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const addToCartHandler = () => {
    dispatch(
      addToCart({
        product,
        quantity,
      })
    );
    Alert.alert("Success", "Product added to cart!");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Product Image */}
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            £{product.price.toFixed(2)} per {product.unit}
          </Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decreaseQuantity}
              >
                <Ionicons name="remove" size={20} color="#2ECC71" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={20} color="#2ECC71" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Price */}
          <View style={styles.totalSection}>
            <Text style={styles.totalText}>
              Total: £{(product.price * quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCartHandler}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
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

export default ProductDetailScreen;
