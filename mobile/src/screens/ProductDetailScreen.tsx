// src/screens/ProductDetailScreen.tsx - Single Product View
import React, { useState, useEffect } from "react";
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
import { productAPI } from "../services/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  unit: string;
}

const ProductDetailScreen: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const loadProductData = async () => {
      const { productId } = route.params || {};
      
      if (productId) {
        // Always fetch from backend for consistent behavior
        try {
          const productData = await productAPI.getProduct(productId);
          
          if (productData) {
            setProduct(productData);
          } else {
            Alert.alert("Error", "Product not found");
            navigation.goBack();
          }
        } catch (error) {
          console.error("Failed to load product details:", error);
          Alert.alert("Error", "Failed to load product details");
          navigation.goBack();
        }
        setLoading(false);
      } else {
        Alert.alert("Error", "Invalid product");
        navigation.goBack();
      }
    };
    
    loadProductData();
  }, [route.params, navigation]);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const addToCartHandler = () => {
    if (!product) return;
    
    dispatch(
      addToCart({
        product,
        quantity,
      })
    );
    Alert.alert("Success", "Product added to cart!");
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          // Check if we can go back in navigation stack
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            // Direct access - navigate to products page
            navigation.navigate('CustomerTabs', { screen: 'Products' });
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Product Image */}
        <Image source={{ uri: product?.imageUrl || '' }} style={styles.productImage} />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product?.name || ''}</Text>
          <Text style={styles.productPrice}>
            £{product?.price?.toFixed(2) || '0.00'} per {product?.unit || ''}
          </Text>
          <Text style={styles.productDescription}>{product?.description || ''}</Text>

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
              Total: £{((product?.price || 0) * quantity).toFixed(2)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  productImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#E0E0E0",
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2ECC71",
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductDetailScreen;
