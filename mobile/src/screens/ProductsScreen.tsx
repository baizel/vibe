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
  ScrollView,
  RefreshControl,
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
  FAB,
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

// Animated FAB Control Component - Deliveroo style
const AnimatedFABControl = ({ 
  product, 
  quantity, 
  onIncrease, 
  onDecrease 
}: {
  product: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}) => {
  const expandAnim = useRef(new Animated.Value(0)).current; // 0 = collapsed, 1 = expanded
  const quantityOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (quantity > 0) {
      // Expand to show full controls
      Animated.parallel([
        Animated.spring(expandAnim, {
          toValue: 1,
          useNativeDriver: false, // We need this for width animation
          tension: 80,
          friction: 8,
        }),
        Animated.timing(quantityOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Collapse to just plus button
      Animated.parallel([
        Animated.spring(expandAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(quantityOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [quantity]);

  const handleAddPress = () => {
    onIncrease();
  };

  const fabWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 120], // Small FAB width (40) to expanded width (120)
  });

  if (quantity === 0) {
    return (
      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          size="small"
          onPress={handleAddPress}
          style={styles.addFab}
        />
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.fabContainer,
        styles.expandedFab,
        { 
          width: fabWidth,
          height: 40, // Fixed height same as small FAB
        }
      ]}
    >
      <TouchableOpacity onPress={onDecrease} style={styles.fabButton}>
        <Text style={styles.fabButtonText}>−</Text>
      </TouchableOpacity>
      
      <Animated.View style={[styles.quantityContainer, { opacity: quantityOpacity }]}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </Animated.View>
      
      <TouchableOpacity onPress={handleAddPress} style={styles.fabButton}>
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>
    </Animated.View>
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
      console.log('🔄 Loading products...');
      const response = await productAPI.getProducts();
      console.log('📦 Raw API response:', response);
      
      const productsData = response.content || response;
      console.log('📋 Products data:', productsData);
      console.log('🔢 Products count:', Array.isArray(productsData) ? productsData.length : 'Not an array');
      
      // Validate data format
      if (!Array.isArray(productsData)) {
        console.warn('⚠️ Products data is not an array:', typeof productsData);
        setProducts([]);
        return;
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error("❌ Failed to load products:", error);
      
      // On Android, if backend is not reachable, show mock data for testing
      if (Platform.OS === 'android') {
        console.log('📱 Android detected - using fallback mock data for testing');
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Fresh Apples',
            description: 'Crisp and sweet red apples',
            price: 2.99,
            imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
            category: 'fruits',
            unit: 'kg'
          },
          {
            id: '2', 
            name: 'Organic Bananas',
            description: 'Naturally ripened organic bananas',
            price: 1.99,
            imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
            category: 'fruits',
            unit: 'kg'
          },
          {
            id: '3',
            name: 'Fresh Milk',
            description: 'Full fat fresh milk',
            price: 1.49,
            imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop',
            category: 'dairy',
            unit: 'liter'
          }
        ];
        setProducts(mockProducts);
      } else {
        Alert.alert("Error", "Failed to load products");
      }
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

  // Mobile/Tablet: Deliveroo-style list item
  const renderMobileProduct = ({ item, index }: { item: Product; index: number }) => {
    return (
      <TouchableOpacity 
        style={styles.productItem}
        onPress={() => navigateToProduct(item)}
        activeOpacity={0.7}
      >
        <View style={styles.productContent}>
          {/* Left side - Product info */}
          <View style={styles.productInfo}>
            <Text variant="titleMedium" style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <Text variant="titleSmall" style={styles.productPrice}>
              £{item.price.toFixed(2)}/{item.unit}
            </Text>
          </View>
          
          {/* Right side - Image with floating FAB */}
          <View style={styles.productImageContainer}>
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
            />
            
            {/* Floating FAB positioned over image */}
            <View style={styles.fabOverlay}>
              <AnimatedFABControl
                product={item}
                quantity={getCartQuantity(item.id)}
                onIncrease={() => handleAddToCart(item)}
                onDecrease={() => handleDecreaseQuantity(item)}
              />
            </View>
          </View>
        </View>
        
        {/* Divider between items (except last item) */}
        {index < filteredProducts.length - 1 && (
          <Divider style={styles.itemDivider} />
        )}
      </TouchableOpacity>
    );
  };

  // Desktop: Card-style grid item using Paper's standard layout
  const renderDesktopProduct = ({ item }: { item: Product }) => {
    return (
      <Surface 
        style={styles.desktopCardContainer}
        elevation={2}
        mode="flat"
      >
        <Card
          style={styles.desktopCard}
          onPress={() => navigateToProduct(item)}
          mode="elevated"
        >
          <Card.Cover 
            source={{ uri: item.imageUrl }}
            style={styles.desktopCardImage}
          />
          
          <Card.Actions style={styles.desktopCardActions}>
            <AnimatedFABControl
              product={item}
              quantity={getCartQuantity(item.id)}
              onIncrease={() => handleAddToCart(item)}
              onDecrease={() => handleDecreaseQuantity(item)}
            />
          </Card.Actions>
          
          <Card.Content style={styles.desktopCardContent}>
            <Text 
              variant="titleMedium"
              numberOfLines={2} 
              style={styles.productName}
            >
              {item.name}
            </Text>
            <Text 
              variant="bodySmall"
              numberOfLines={2} 
              style={styles.productDescription}
            >
              {item.description}
            </Text>
            <Text 
              variant="titleSmall"
              style={styles.productPrice}
            >
              £{item.price.toFixed(2)}/{item.unit}
            </Text>
          </Card.Content>
        </Card>
      </Surface>
    );
  };

  // Choose render function based on viewport width
  const renderProduct = isDesktop ? renderDesktopProduct : renderMobileProduct;

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
    styles.container,
    isWeb && styles.webContainer,
  ];

  const contentContainerStyle = [
    styles.content,
    isDesktop && styles.webContent,
    isDesktop && styles.desktopContent,
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
        ) : isDesktop ? (
          // Desktop: Scrollable grid layout
          <ScrollView
            style={styles.desktopGrid}
            contentContainerStyle={styles.desktopGridContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={loadProducts}
              />
            }
          >
            {filteredProducts.map((item) => (
              <View key={item.id} style={styles.desktopGridItem}>
                {renderDesktopProduct({ item })}
              </View>
            ))}
          </ScrollView>
        ) : (
          // Mobile: Standard FlatList
          <FlatList
            data={filteredProducts}
            renderItem={renderMobileProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsList}
            refreshing={isLoading}
            onRefresh={loadProducts}
            showsVerticalScrollIndicator={false}
            style={styles.flatListContainer}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webContainer: {
    backgroundColor: "#ffffff",
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
    paddingVertical: spacing.xs,
  },
  flatListContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  
  // Deliveroo-style list item
  productItem: {
    backgroundColor: "#ffffff",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  productContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  productName: {
    color: "#1a1a1a",
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  productDescription: {
    color: "#666",
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  productPrice: {
    color: "#2ECC71",
    fontWeight: "700",
  },
  productImageContainer: {
    position: "relative",
    width: 90,
    height: 90,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  itemDivider: {
    marginTop: spacing.md,
    backgroundColor: "#f0f0f0",
  },

  // Desktop layout using Paper's standard components
  desktopGrid: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  desktopGridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: spacing.md,
    paddingBottom: spacing.xl, // Extra padding at bottom
  },
  desktopGridItem: {
    width: "23%", // 4-column layout with space for margins
    marginBottom: spacing.lg,
  },
  desktopCardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  desktopCard: {
    backgroundColor: "#ffffff",
    ...Platform.select({
      web: {
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
        }
      }
    }),
  },
  desktopCardImage: {
    height: 180,
    backgroundColor: "#E0E0E0",
  },
  desktopCardActions: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "transparent",
    padding: 0,
    minHeight: 0,
  },
  desktopCardContent: {
    padding: spacing.md,
  },
  
  // FAB styles
  fabOverlay: {
    position: "absolute",
    bottom: -8,
    right: -8,
  },
  fabContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  addFab: {
    backgroundColor: "#2ECC71",
  },
  expandedFab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ECC71",
    borderRadius: 20, // Smaller border radius to match 40px height
    paddingHorizontal: spacing.xs,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fabButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  quantityText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProductsScreen;
