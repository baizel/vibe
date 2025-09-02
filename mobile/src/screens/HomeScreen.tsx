// src/screens/HomeScreen.tsx - Customer Home Screen with Responsive Layout
import React, { useEffect, useState, useRef } from "react";
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
  Dimensions,
  Animated,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
  Badge,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useResponsive } from "../hooks/useResponsive";
import { spacing } from "../utils/responsive";
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

interface ShopStatus {
  isOpen: boolean;
  nextDelivery: string;
  takingOrders: boolean;
  message: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor: string;
  action: string;
}

// Animated Price Component
const AnimatedPrice = ({ 
  price, 
  unit, 
  hasQuantity 
}: {
  price: number;
  unit: string;
  hasQuantity: boolean;
}) => {
  const fontSize = useRef(new Animated.Value(hasQuantity ? 11 : 13)).current;
  
  useEffect(() => {
    Animated.spring(fontSize, {
      toValue: hasQuantity ? 11 : 13,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();
  }, [hasQuantity]);

  return (
    <Animated.Text style={[
      styles.productPrice,
      { fontSize: fontSize }
    ]}>
      £{price.toFixed(2)}/{unit}
    </Animated.Text>
  );
};

// Animated Product Quantity Control Component
const ProductQuantityControl = ({ 
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
  const containerWidth = useRef(new Animated.Value(32)).current; // Start with + button width
  const minusOpacity = useRef(new Animated.Value(0)).current;
  const minusTranslateX = useRef(new Animated.Value(50)).current; // Start from outside container
  const quantityOpacity = useRef(new Animated.Value(0)).current;
  const quantityTranslateX = useRef(new Animated.Value(25)).current; // Start from center of + button
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (quantity > 0) {
      // Animate to expanded state
      Animated.parallel([
        // Expand container
        Animated.spring(containerWidth, {
          toValue: 98, // Wider to fit 3 buttons properly
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
        // Slide minus button from right to left with 700ms duration
        Animated.timing(minusTranslateX, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        // Fade in minus button
        Animated.timing(minusOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        // Slide quantity number from right to center with 700ms duration
        Animated.timing(quantityTranslateX, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        // Fade in quantity
        Animated.timing(quantityOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate to collapsed state
      Animated.parallel([
        // Collapse container
        Animated.spring(containerWidth, {
          toValue: 32,
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
  }, [quantity]);

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
            style={[styles.quantityButton, { backgroundColor: "#E74C3C" }]}
            onPress={onDecrease}
          >
            <Ionicons name="remove" size={14} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quantity text - slides in from right */}
        <Animated.Text style={[
          styles.quantityTextFixed,
          {
            opacity: quantityOpacity,
            transform: [{ translateX: quantityTranslateX }],
          }
        ]}>
          {quantity}
        </Animated.Text>

        {/* Plus button - always in the same position */}
        <TouchableOpacity 
          style={[styles.quantityButton, styles.plusButton]}
          onPress={handleAddPress}
        >
          <Ionicons name="add" size={14} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shopStatus, setShopStatus] = useState<ShopStatus>({
    isOpen: true,
    nextDelivery: 'Tomorrow, 2:00 PM',
    takingOrders: true,
    message: 'Fresh deliveries available!'
  });
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { isTablet, isDesktop, dimensions } = useResponsive();
  const carouselTimerRef = useRef<NodeJS.Timeout>();
  
  const promotions: Promotion[] = [
    {
      id: '1',
      title: 'Fresh Arrivals Daily',
      description: 'Premium quality meats delivered fresh to your door',
      imageUrl: 'https://via.placeholder.com/400x200/2ECC71/FFFFFF?text=Fresh+Daily',
      backgroundColor: '#2ECC71',
      action: 'Shop Now'
    },
    {
      id: '2', 
      title: '20% Off First Order',
      description: 'New customers get 20% off their first delivery',
      imageUrl: 'https://via.placeholder.com/400x200/E74C3C/FFFFFF?text=20%25+OFF',
      backgroundColor: '#E74C3C',
      action: 'Get Discount'
    },
    {
      id: '3',
      title: 'Weekend Special',
      description: 'Premium cuts at special weekend prices',
      imageUrl: 'https://via.placeholder.com/400x200/3498DB/FFFFFF?text=Weekend+Special',
      backgroundColor: '#3498DB', 
      action: 'View Deals'
    },
  ];

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      // Fetch real data from backend
      const response = await productAPI.getProducts();
      const productsData = response.content || response;
      
      // Take first 4 products as featured
      const featuredData = productsData.slice(0, 4);
      setFeaturedProducts(featuredData);
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
      dispatch(updateQuantity({ 
        productId: product.id, 
        quantity: currentQuantity + 1 
      }));
    } else {
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
      dispatch(updateQuantity({ 
        productId: product.id, 
        quantity: 0 
      }));
    }
  };

  // Auto-rotate promotions
  useEffect(() => {
    if (isDesktop || isTablet) {
      carouselTimerRef.current = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
      }, 5000); // Change every 5 seconds
      
      return () => {
        if (carouselTimerRef.current) {
          clearInterval(carouselTimerRef.current);
        }
      };
    }
  }, [isDesktop, isTablet, promotions.length]);
  
  const renderDesktopLayout = () => (
    <View style={[styles.desktopContainer, { padding: spacing.lg }]}>
      {/* Hero Section with Promotions */}
      <Surface style={styles.heroSection} elevation={2}>
        <View style={styles.promotionCard}>
          <View style={styles.promoImageContainer}>
            <Image 
              source={{ uri: promotions[currentPromoIndex].imageUrl }}
              style={styles.promoImage}
            />
          </View>
          <View style={styles.promoContent}>
            <Title style={styles.promoTitle}>
              {promotions[currentPromoIndex].title}
            </Title>
            <Paragraph style={styles.promoDescription}>
              {promotions[currentPromoIndex].description}
            </Paragraph>
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('Products')}
              style={[styles.promoButton, {
                backgroundColor: promotions[currentPromoIndex].backgroundColor
              }]}
            >
              {promotions[currentPromoIndex].action}
            </Button>
          </View>
        </View>
        
        {/* Promotion Indicators */}
        <View style={styles.promoIndicators}>
          {promotions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.promoIndicator,
                currentPromoIndex === index && styles.promoIndicatorActive
              ]}
              onPress={() => setCurrentPromoIndex(index)}
            />
          ))}
        </View>
      </Surface>
      
      {/* Shop Status and Stats */}
      <View style={styles.statusRow}>
        <Card style={styles.statusCard} mode="elevated">
          <Card.Content>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIndicator, {
                backgroundColor: shopStatus.takingOrders ? '#2ECC71' : '#E74C3C'
              }]} />
              <Title style={styles.statusTitle}>
                {shopStatus.takingOrders ? 'Taking Orders' : 'Orders Closed'}
              </Title>
            </View>
            <Paragraph style={styles.statusMessage}>{shopStatus.message}</Paragraph>
            <View style={styles.deliveryInfo}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.deliveryText}>Next Delivery: {shopStatus.nextDelivery}</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard} mode="elevated">
          <Card.Content>
            <Title style={styles.statsTitle}>Quick Stats</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>150+</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8★</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2-24h</Text>
                <Text style={styles.statLabel}>Delivery</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsDesktop}>
        <Card style={styles.actionCard} mode="elevated">
          <TouchableOpacity 
            style={styles.actionCardContent}
            onPress={() => navigation.navigate('Products')}
          >
            <Ionicons name="storefront" size={32} color="#2ECC71" />
            <Title style={styles.actionTitle}>Shop Now</Title>
            <Paragraph style={styles.actionDescription}>Browse our full catalog</Paragraph>
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.actionCard} mode="elevated">
          <TouchableOpacity 
            style={styles.actionCardContent}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="basket" size={32} color="#3498DB" />
            <Title style={styles.actionTitle}>View Cart</Title>
            <Paragraph style={styles.actionDescription}>Check your items</Paragraph>
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.actionCard} mode="elevated">
          <TouchableOpacity 
            style={styles.actionCardContent}
            onPress={() => navigation.navigate('Orders')}
          >
            <Ionicons name="receipt" size={32} color="#9B59B6" />
            <Title style={styles.actionTitle}>Orders</Title>
            <Paragraph style={styles.actionDescription}>Track your deliveries</Paragraph>
          </TouchableOpacity>
        </Card>
      </View>
    </View>
  );
  
  const renderMobileLayout = () => (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Message */}
      <View style={[styles.welcomeSection, { paddingHorizontal: spacing.md }]}>
        <Text style={styles.greeting}>
          Hello, {user?.firstName || "Customer"}!
        </Text>
        <Text style={styles.subtitle}>
          Fresh meat delivered to your door
        </Text>
      </View>
      
      {/* Shop Status on Mobile */}
      <Surface style={styles.mobileStatusCard} elevation={1}>
        <View style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, {
              backgroundColor: shopStatus.takingOrders ? '#2ECC71' : '#E74C3C'
            }]} />
            <Text style={styles.statusTitle}>
              {shopStatus.takingOrders ? 'Taking Orders' : 'Orders Closed'}
            </Text>
          </View>
          <Text style={styles.deliveryText}>Next Delivery: {shopStatus.nextDelivery}</Text>
        </View>
      </Surface>

      {/* Categories */}
      <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
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
                  <View style={styles.priceRowFixed}>
                    <AnimatedPrice 
                      price={product.price}
                      unit={product.unit}
                      hasQuantity={getCartQuantity(product.id) > 0}
                    />
                  </View>
                </View>
                <ProductQuantityControl 
                  product={product}
                  quantity={getCartQuantity(product.id)}
                  onIncrease={() => handleAddToCart(product)}
                  onDecrease={() => handleDecreaseQuantity(product)}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions - removed on mobile as requested */}
    </ScrollView>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {(isDesktop || isTablet) ? renderDesktopLayout() : renderMobileLayout()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  
  // Desktop Layout
  desktopContainer: {
    flex: 1,
  },
  heroSection: {
    marginBottom: spacing.lg,
    borderRadius: spacing.md,
    overflow: 'hidden',
  },
  promotionCard: {
    flexDirection: 'row',
    height: 300,
  },
  promoImageContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoContent: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: '#1a1a1a',
  },
  promoDescription: {
    fontSize: 18,
    color: '#666',
    marginBottom: spacing.lg,
    lineHeight: 26,
  },
  promoButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  promoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
  },
  promoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  promoIndicatorActive: {
    backgroundColor: '#2ECC71',
  },
  
  // Status and Stats Row
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  statusCard: {
    flex: 2,
    backgroundColor: '#fff',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusMessage: {
    color: '#666',
    marginBottom: spacing.md,
    fontSize: 16,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    marginLeft: spacing.xs,
    color: '#666',
    fontSize: 14,
  },
  
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Quick Actions Desktop
  quickActionsDesktop: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  actionCardContent: {
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.sm,
    color: '#1a1a1a',
  },
  actionDescription: {
    textAlign: 'center',
    color: '#666',
    marginTop: spacing.xs,
  },
  
  // Mobile Layout
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
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
  
  mobileStatusCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: spacing.sm,
  },
  statusContent: {
    alignItems: 'flex-start',
  },
  
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  seeAllText: {
    color: "#2ECC71",
    fontSize: 16,
    fontWeight: "500",
  },
  categoriesScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: spacing.lg,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
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
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E0E0E0",
  },
  productInfo: {
    padding: spacing.md,
    paddingBottom: spacing.sm, // Reduce bottom padding to make room for quantity controls
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceRowFixed: {
    marginTop: 4,
    height: 16, // Fixed height to prevent layout shifts
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontWeight: "600",
    color: "#2ECC71",
    // fontSize is now animated, removed static value
  },
  quantityContainer: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.md,
    height: 32, // Fixed height to prevent layout shifts
  },
  quantityControlsFixed: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
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
  quantityButton: {
    width: 32, // Same size as original add button
    height: 32,
    borderRadius: 16,
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
    top: 9,
    left: 35, // Between minus and plus buttons
    fontSize: 13,
    fontWeight: "bold",
    color: "#2ECC71",
    width: 24,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.lg,
    marginHorizontal: 5,
    backgroundColor: "#F8F9FA",
    borderRadius: spacing.md,
  },
  quickActionText: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default HomeScreen;
