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
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors, commonStyles, productStyles } from "../styles/globalStyles";
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

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialCategory = route.params?.category || "all";
  
  const { width } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  useEffect(() => {
    loadProducts();
    setSelectedCategory(initialCategory);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      const productsData = response.content || response;
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load products:", error);
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

  const [categories, setCategories] = useState(["all"]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await productAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // Calculate responsive grid
  const getNumColumns = () => {
    if (isDesktop) return 4;
    if (isTablet) return 3;
    return 2;
  };

  const getProductWidth = () => {
    const numColumns = getNumColumns();
    const padding = isWeb ? 40 : 20;
    const margin = 10;
    return `${(100 / numColumns) - (margin * 2 / numColumns)}%`;
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        productStyles.productCard,
        isWeb && { width: getProductWidth() },
        isDesktop && productStyles.productCardDesktop
      ]}
      onPress={() => navigateToProduct(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={productStyles.productImage} />
      <View style={productStyles.productInfo}>
        <Text style={productStyles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={productStyles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={productStyles.productFooter}>
          <Text style={productStyles.productPrice}>
            £{item.price.toFixed(2)}/{item.unit}
          </Text>
          <TouchableOpacity style={productStyles.addButton}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const containerStyle = [
    commonStyles.container,
    isWeb && commonStyles.webContainer,
  ];

  const contentContainerStyle = [
    commonStyles.webContent,
    isDesktop && commonStyles.desktopContent
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <View style={contentContainerStyle}>
        {/* Header - hidden on web since we have navigation header */}
        {!isWeb && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Products</Text>
          </View>
        )}

        {/* Search and Filter Section */}
        <View style={[styles.searchFilterSection, isDesktop && styles.searchFilterSectionDesktop]}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, isDesktop && styles.searchContainerDesktop]}>
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
          <View style={[styles.categoryFilter, isDesktop && styles.categoryFilterDesktop]}>
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
        </View>

        {/* Products List */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={getNumColumns()}
          key={getNumColumns()} // Force re-render when columns change
          contentContainerStyle={[styles.productsList, isDesktop && styles.productsListDesktop]}
          refreshing={isLoading}
          onRefresh={loadProducts}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webContainer: {
    backgroundColor: "#f8f9fa",
  },
  desktopContainer: {
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  webContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  desktopContent: {
    paddingHorizontal: 40,
    paddingTop: 20,
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
  searchFilterSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchFilterSectionDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
    paddingHorizontal: 0,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  searchContainerDesktop: {
    flex: 1,
    marginBottom: 0,
    height: 48,
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
    marginBottom: 15,
  },
  categoryFilterDesktop: {
    marginBottom: 0,
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
  productsListDesktop: {
    paddingHorizontal: 0,
    paddingBottom: 40,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: "1%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e8ed",
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }
    }),
  },
  productCardDesktop: {
    marginHorizontal: 5,
    marginBottom: 20,
    ...Platform.select({
      web: {
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }
      }
    }),
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
