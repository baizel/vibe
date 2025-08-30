// src/screens/ProductsScreen.tsx - Products Listing
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  unit: string;
}

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialCategory = route.params?.category || "all";

  useEffect(() => {
    loadProducts();
    setSelectedCategory(initialCategory);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      // Mock data for MVP
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Premium Beef Ribeye",
          description: "Fresh, high-quality ribeye steak perfect for grilling",
          price: 28.99,
          imageUrl:
            "https://via.placeholder.com/200x120/FF6B6B/FFFFFF?text=Ribeye",
          category: "beef",
          unit: "kg",
        },
        {
          id: "2",
          name: "Free Range Chicken Breast",
          description: "Organic chicken breast fillets, hormone-free",
          price: 12.99,
          imageUrl:
            "https://via.placeholder.com/200x120/4ECDC4/FFFFFF?text=Chicken",
          category: "chicken",
          unit: "kg",
        },
        {
          id: "3",
          name: "Fresh Salmon Fillet",
          description: "Wild-caught salmon fillets, rich in omega-3",
          price: 24.99,
          imageUrl:
            "https://via.placeholder.com/200x120/45B7D1/FFFFFF?text=Salmon",
          category: "seafood",
          unit: "kg",
        },
        {
          id: "4",
          name: "Pork Tenderloin",
          description: "Lean pork tenderloin cuts, perfect for roasting",
          price: 16.99,
          imageUrl:
            "https://via.placeholder.com/200x120/F7DC6F/FFFFFF?text=Pork",
          category: "pork",
          unit: "kg",
        },
        {
          id: "5",
          name: "Ground Beef 80/20",
          description: "Fresh ground beef, 80% lean, perfect for burgers",
          price: 8.99,
          imageUrl:
            "https://via.placeholder.com/200x120/FF6B6B/FFFFFF?text=Ground+Beef",
          category: "beef",
          unit: "kg",
        },
        {
          id: "6",
          name: "Chicken Thighs",
          description: "Juicy chicken thighs with skin, bone-in",
          price: 9.99,
          imageUrl:
            "https://via.placeholder.com/200x120/4ECDC4/FFFFFF?text=Thighs",
          category: "chicken",
          unit: "kg",
        },
        {
          id: "7",
          name: "Fresh Cod Fillet",
          description: "White fish fillet, mild flavor, great for frying",
          price: 18.99,
          imageUrl:
            "https://via.placeholder.com/200x120/45B7D1/FFFFFF?text=Cod",
          category: "seafood",
          unit: "kg",
        },
        {
          id: "8",
          name: "Pork Chops",
          description: "Bone-in pork chops, center cut, premium quality",
          price: 14.99,
          imageUrl:
            "https://via.placeholder.com/200x120/F7DC6F/FFFFFF?text=Pork+Chops",
          category: "pork",
          unit: "kg",
        },
      ];

      setProducts(mockProducts);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const navigateToProduct = (product: Product) => {
    navigation.navigate("ProductDetail", { product });
  };

  const categories = ["all", "beef", "chicken", "pork", "seafood"];

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigateToProduct(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            £{item.price.toFixed(2)}/{item.unit}
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilterButton,
                selectedCategory === item && styles.categoryFilterButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === item && styles.categoryFilterTextActive,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        refreshing={isLoading}
        onRefresh={loadProducts}
      />
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
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
  productCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: "1%",
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
});

export default ProductsScreen;
