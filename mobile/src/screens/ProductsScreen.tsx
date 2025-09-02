// src/screens/ProductsScreen.tsx - Products Listing with Material Paper UI
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  Alert,
  Platform,
  Dimensions,
  Animated,
  TouchableOpacity,
  Easing,
} from "react-native";
import {
  Card,
  Text,
  Searchbar,
  Chip,
  Button,
  IconButton,
  ActivityIndicator,
  Surface,
  Divider,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { colors, commonStyles, productStyles } from "../styles/globalStyles";
import { productAPI } from "../services/api";
import { useResponsive } from "../hooks/useResponsive";
import { wp, hp, spacing, responsiveStyles } from "../utils/responsive";
import { addToCart, updateQuantity } from "../store/cartSlice";
import { RootState } from "../store/store";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  unit: string;
}

// Animated Product Quantity Control Component for ProductsScreen
const ProductQuantityControl = ({ 
  product, 
  quantity, 
  onIncrease, 
  onDecrease,
  isDesktop 
}: {
  product: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isDesktop?: boolean;
}) => {
  const containerWidth = useRef(new Animated.Value(isDesktop ? 32 : 28)).current; // Start with + button width
  const minusOpacity = useRef(new Animated.Value(0)).current;
  const minusTranslateX = useRef(new Animated.Value(50)).current; // Start from outside container
  const quantityOpacity = useRef(new Animated.Value(0)).current;
  const quantityTranslateX = useRef(new Animated.Value(25)).current; // Start from center of + button
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const buttonSize = isDesktop ? 32 : 28;
  const expandedWidth = isDesktop ? 110 : 98;
  
  useEffect(() => {
    if (quantity > 0) {
      // Animate to expanded state
      Animated.parallel([
        // Expand container
        Animated.spring(containerWidth, {
          toValue: expandedWidth,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
        // Slide minus button from right to left with smooth easing curve
        Animated.timing(minusTranslateX, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Fade in minus button
        Animated.timing(minusOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Slide quantity number from right to center with smooth easing curve
        Animated.timing(quantityTranslateX, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Fade in quantity
        Animated.timing(quantityOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate to collapsed state
      Animated.parallel([
        // Collapse container
        Animated.spring(containerWidth, {
          toValue: buttonSize,
          useNativeDriver: false,
          tension: 120,
          friction: 9,
        }),
        // Slide minus button to right
        Animated.spring(minusTranslateX, {
          toValue: 50,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        // Fade out minus button
        Animated.timing(minusOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Slide quantity number to right
        Animated.spring(quantityTranslateX, {
          toValue: 25,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        // Fade out quantity
        Animated.timing(quantityOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [quantity, buttonSize, expandedWidth]);

  const handleAddPress = () => {
    // Quick press feedback
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
    ]).start();
    
    onIncrease();
  };

  return (
    <View style={styles.quantityContainer}>
      {/* Fixed container that doesn't affect price layout */}
      <Animated.View style={[
        styles.quantityControlsFixed,
        { 
          width: containerWidth,
          height: buttonSize,
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        {/* Minus button - slides in from right */}
        <Animated.View style={[
          styles.minusButtonContainer,
          {
            opacity: minusOpacity,
            transform: [{ translateX: minusTranslateX }],
          }
        ]}>
          <TouchableOpacity 
            style={[styles.quantityButtonAnimated, { 
              backgroundColor: "#E74C3C",
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            }]}
            onPress={onDecrease}
          >
            <Text style={[styles.quantityButtonText, { fontSize: isDesktop ? 16 : 14 }]}>−</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quantity text - slides in from right */}
        <Animated.Text style={[
          styles.quantityTextFixed,
          {
            opacity: quantityOpacity,
            transform: [{ translateX: quantityTranslateX }],
            fontSize: isDesktop ? 16 : 14,
            top: isDesktop ? 8 : 7,
            left: isDesktop ? 40 : 35,
          }
        ]}>
          {quantity}
        </Animated.Text>

        {/* Plus button - always in the same position */}
        <TouchableOpacity 
          style={[styles.quantityButtonAnimated, styles.plusButton, {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          }]}
          onPress={handleAddPress}
        >
          <Text style={[styles.quantityButtonText, { fontSize: isDesktop ? 16 : 14 }]}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const initialCategory = route.params?.category || "all";
  
  const { dimensions, isTablet, isDesktop, getResponsiveColumns, getItemWidth } = useResponsive();
  const isWeb = Platform.OS === 'web';
  const columns = getResponsiveColumns();
  const itemWidth = getItemWidth(columns);

  useEffect(() => {
    loadProducts();
    setSelectedCategory(initialCategory);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    if (products.length > 0) {
      loadCategories();
    }
  }, [products]);

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
    navigation.navigate("ProductDetail", { 
      productId: product.id
    });
  };

  const getCartQuantity = (productId: string) => {
    const cartItem = cartItems.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (product: Product) => {
    const currentQuantity = getCartQuantity(product.id);
    
    if (currentQuantity > 0) {
      // Update existing item
      dispatch(updateQuantity({ 
        productId: product.id, 
        quantity: currentQuantity + 1 
      }));
    } else {
      // Add new item
      dispatch(addToCart({ 
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          unit: product.unit,
        }, 
        quantity: 1 
      }));
    }
    Alert.alert("Added to Cart", `${product.name} quantity: ${currentQuantity + 1}`);
  };

  const handleDecreaseQuantity = (product: Product) => {
    const currentQuantity = getCartQuantity(product.id);
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ 
        productId: product.id, 
        quantity: currentQuantity - 1 
      }));
    } else if (currentQuantity === 1) {
      // Remove from cart
      dispatch(updateQuantity({ 
        productId: product.id, 
        quantity: 0 
      }));
    }
  };

  const [categories, setCategories] = useState<string[]>([]);

  const loadCategories = async () => {
    try {
      const categoriesData = await productAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // Calculate responsive grid
  const getNumColumns = () => columns;

  const getProductWidth = () => {
    if (isWeb) {
      return itemWidth - (spacing.sm * 2);
    }
    return `${(100 / columns) - 2}%`;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const cardWidth = isWeb ? itemWidth - spacing.sm : undefined;
    
    return (
      <Card
        style={[
          styles.productCard,
          {
            width: cardWidth,
            marginHorizontal: isWeb ? spacing.sm / 2 : '1%',
            marginBottom: spacing.md,
          },
          isDesktop && styles.productCardDesktop
        ]}
        onPress={() => navigateToProduct(item)}
        mode="elevated"
      >
        <Image 
          source={{ uri: item.imageUrl }} 
          style={[
            styles.productImage,
            {
              height: isTablet ? 180 : isDesktop ? 200 : 140
            }
          ]} 
        />
        <Card.Content style={{ padding: spacing.md }}>
          <Text 
            variant={isDesktop ? "titleLarge" : "titleMedium"} 
            numberOfLines={2} 
            style={styles.productName}
          >
            {item.name}
          </Text>
          <Text 
            variant={isDesktop ? "bodyMedium" : "bodySmall"} 
            numberOfLines={2} 
            style={styles.productDescription}
          >
            {item.description}
          </Text>
          <View style={styles.productFooterFixed}>
            <Text 
              variant={isDesktop ? "titleMedium" : "titleSmall"} 
              style={styles.productPrice}
            >
              £{item.price.toFixed(2)}/{item.unit}
            </Text>
          </View>
          <ProductQuantityControl 
            product={item}
            quantity={getCartQuantity(item.id)}
            onIncrease={() => handleAddToCart(item)}
            onDecrease={() => handleDecreaseQuantity(item)}
            isDesktop={isDesktop}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Surface style={styles.emptyStateContainer} elevation={1}>
      <IconButton
        icon="package-variant-closed"
        size={64}
        iconColor="#666"
      />
      <Text variant="headlineSmall" style={styles.emptyStateTitle}>
        No Products Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyStateMessage}>
        {searchQuery || selectedCategory !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Products will appear here when they are available'}
      </Text>
      {(searchQuery || selectedCategory !== 'all') && (
        <Button
          mode="outlined"
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
          style={styles.clearFiltersButton}
        >
          Clear Filters
        </Button>
      )}
    </Surface>
  );

  const containerStyle = [
    commonStyles.container,
    isWeb && commonStyles.webContainer,
  ];

  const contentContainerStyle = [
    isWeb ? {
      width: '100%',
      maxWidth: '100vw',
      paddingHorizontal: 0,
      flex: 1, // Allow container to expand
    } : commonStyles.webContent,
    isDesktop && {
      paddingTop: spacing.lg,
    }
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <View style={contentContainerStyle}>
        {/* Header - hidden on web since we have navigation header */}
        {!isWeb && (
          <Surface style={styles.header} elevation={1}>
            <Text variant="headlineMedium" style={styles.headerTitle}>Products</Text>
          </Surface>
        )}

        {/* Search and Filter Section */}
        <Surface style={[
          styles.searchFilterSection,
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'flex-start' : 'stretch',
            gap: isDesktop ? spacing.lg : spacing.md,
          }
        ]} elevation={0}>
          {/* Search Bar */}
          <Searchbar
            placeholder="Search products..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchbar,
              {
                flex: isDesktop ? 1 : undefined,
                marginBottom: isDesktop ? 0 : spacing.md,
                fontSize: isDesktop ? 18 : 16,
              }
            ]}
          />

          {/* Category Filter */}
          <View style={[
            styles.categoryFilter,
            {
              minWidth: isDesktop ? 300 : undefined,
            }
          ]}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item}
              contentContainerStyle={{
                paddingVertical: spacing.xs,
                gap: spacing.xs,
              }}
              ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
              renderItem={({ item }) => (
                <Chip
                  mode={selectedCategory === item ? 'flat' : 'outlined'}
                  selected={selectedCategory === item}
                  onPress={() => setSelectedCategory(item)}
                  style={{
                    marginVertical: spacing.xs / 2,
                  }}
                  textStyle={{
                    fontSize: isDesktop ? 16 : 14,
                    color: selectedCategory === item ? '#2ECC71' : '#666',
                    fontWeight: selectedCategory === item ? '600' : 'normal',
                  }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Chip>
              )}
            />
          </View>
        </Surface>

        {/* Products List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} size="large" style={styles.loader} />
            <Text variant="bodyLarge" style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={getNumColumns()} // Use same logic for both web and mobile
            key={`${getNumColumns()}-${dimensions.width}`} // Force re-render when columns or width changes
            contentContainerStyle={[
              styles.productsList,
              {
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.xl,
                // Remove conflicting flexDirection/flexWrap for web
              }
            ]}
            refreshing={isLoading}
            onRefresh={loadProducts}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }} // Ensure FlatList can expand to take available space
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: spacing.xs,
  },
  headerTitle: {
    color: "#1a1a1a",
  },
  searchFilterSection: {
    backgroundColor: "#fff",
    marginBottom: spacing.xs,
  },
  searchbar: {
    elevation: 2,
  },
  categoryFilter: {
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loader: {
    marginBottom: spacing.md,
  },
  loadingText: {
    color: "#666",
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    margin: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: spacing.md,
  },
  emptyStateTitle: {
    color: "#333",
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    color: "#666",
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  clearFiltersButton: {
    marginTop: spacing.sm,
  },
  productsList: {
    // Responsive padding handled inline
  },
  productCard: {
    backgroundColor: "#fff",
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }
    }),
  },
  productCardDesktop: {
    ...Platform.select({
      web: {
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }
    }),
  },
  productImage: {
    width: "100%",
    backgroundColor: "#E0E0E0",
    resizeMode: 'cover',
  },
  productName: {
    color: "#1a1a1a",
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  productDescription: {
    color: "#666",
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  productPrice: {
    color: "#2ECC71",
    fontWeight: "700",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  productFooterFixed: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    // Price stays in fixed position, no space-between layout
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButton: {
    margin: 0,
    width: 28,
    height: 28,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2ECC71",
    marginHorizontal: 6,
    minWidth: 20,
    textAlign: "center",
  },
  // New animated quantity control styles
  quantityContainer: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.md,
    height: 32, // Fixed height to prevent layout shifts
  },
  quantityControlsFixed: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden", // Hide elements sliding outside
  },
  minusButtonContainer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  quantityButtonAnimated: {
    justifyContent: "center",
    alignItems: "center",
  },
  plusButton: {
    backgroundColor: "#2ECC71",
    position: "absolute",
    right: 0,
    top: 0,
  },
  quantityTextFixed: {
    position: "absolute",
    fontWeight: "bold",
    color: "#2ECC71",
    width: 24,
    textAlign: "center",
  },
  quantityButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ProductsScreen;
