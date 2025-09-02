import React, { useState, useRef, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { Platform } from "react-native";
import { colors, commonStyles, webHeaderStyles } from "../styles/globalStyles";
import { useResponsive } from "../hooks/useResponsive";
import { spacing } from "../utils/responsive";
import { RootState } from "../store/store";
import {
  Drawer,
  List,
  IconButton,
} from "react-native-paper";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ProductsScreen from "../screens/ProductsScreen";
import CartScreen from "../screens/CartScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OrdersScreen from "../screens/OrdersScreen";
import AdminScreen from "../screens/AdminScreen";

// Temporary placeholder components for Orders and Profile
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  PanResponder,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Desktop Cart Icon with Badge
const DesktopCartIcon = ({ navigation }: { navigation: any }) => {
  const { items } = useSelector((state: RootState) => state.cart);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <TouchableOpacity 
      style={[webHeaderStyles.webActionItem, {
        padding: spacing.sm,
        position: 'relative',
      }]}
      onPress={() => navigation.navigate('Cart')}
    >
      <Ionicons name="basket-outline" size={24} color={colors.dark} />
      {totalItems > 0 && (
        <View style={styles.desktopCartBadge}>
          <Text style={styles.desktopCartBadgeText}>
            {totalItems > 99 ? '99+' : totalItems.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Responsive Header Component
const ResponsiveHeader = ({ navigation: navProp }: { navigation?: any }) => {
  const navigation = navProp || useNavigation<any>();
  const { user, isAuthenticated } = useAuth();
  const { isTablet, isDesktop, dimensions } = useResponsive();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current; // Start off-screen to the left
  
  // Show hamburger menu on mobile, full nav on tablet+
  const showMobileMenu = !isTablet;

  // Create pan responder for gesture support
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Trigger horizontal swipe detection
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderGrant: () => {
        // Gesture started
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!showMobileMenu) return;
        
        const { dx } = gestureState;
        
        if (!drawerVisible) {
          // Swipe from left edge to open (only if swipe starts near left edge)
          if (evt.nativeEvent.pageX < 50 && dx > 0) {
            const newValue = Math.max(-280, Math.min(0, -280 + dx));
            slideAnim.setValue(newValue);
          }
        } else {
          // Drawer is open, allow swiping left to close
          if (dx < 0) {
            const newValue = Math.max(-280, Math.min(0, dx));
            slideAnim.setValue(newValue);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!showMobileMenu) return;
        
        const { dx, vx } = gestureState;
        
        if (!drawerVisible) {
          // Opening gesture
          if (dx > 100 || vx > 0.5) {
            openDrawer();
          } else {
            // Snap back closed
            Animated.timing(slideAnim, {
              toValue: -280,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Closing gesture
          if (dx < -100 || vx < -0.5) {
            closeDrawer();
          } else {
            // Snap back open
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    })
  ).current;

  // ResponsiveHeader is only used for desktop screens (>768px) in StackWithHeaderNavigator
  // Mobile screens (≤768px) use CustomerTabNavigator and never see this header
  const isMobile = false; // Always desktop layout since this header is only for desktop

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerVisible(false));
  };
  
  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Add click outside detection for web and create DOM portal for drawer
  useEffect(() => {
    if (Platform.OS === 'web' && drawerVisible) {
      const handleClickOutside = (event: any) => {
        const target = event.target;
        const drawer = document.querySelector('[data-drawer="true"]');
        if (drawer && !drawer.contains(target)) {
          closeDrawer();
        }
      };
      
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [drawerVisible]);

  // Create professional native DOM drawer for web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && showMobileMenu && drawerVisible) {
      // Create the drawer with professional styling
      const drawer = document.createElement('div');
      drawer.id = 'native-drawer';
      drawer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 280px;
        height: 100vh;
        background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
        box-shadow: 2px 0 20px rgba(0,0,0,0.15);
        z-index: 999999;
        transform: translateX(0);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        border-right: 1px solid #e5e7eb;
      `;
      
      // Professional drawer content with consistent styling
      drawer.innerHTML = `
        <!-- Header -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #fff;
          min-height: 70px;
          box-sizing: border-box;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #2ECC71, #27AE60);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 16px;
              font-weight: 600;
            ">🏪</div>
            <span style="
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
            ">YorkMart</span>
          </div>
          <button id="close-drawer" style="
            background: none;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #6b7280;
            font-size: 18px;
            transition: all 0.2s;
            hover: background-color: #f3f4f6;
          " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">×</button>
        </div>

        <!-- Navigation Items -->
        <div style="flex: 1; padding: 8px 0; overflow-y: auto;">
          <div id="nav-home" style="
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 20px;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 0;
            color: #374151;
            font-size: 16px;
            font-weight: 500;
          " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </div>
          
          <div id="nav-products" style="
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 20px;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 0;
            color: #374151;
            font-size: 16px;
            font-weight: 500;
          " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
            </svg>
            <span>Products</span>
          </div>
          
          <div id="nav-orders" style="
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 20px;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 0;
            color: #374151;
            font-size: 16px;
            font-weight: 500;
          " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='transparent'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 17H7V15H17V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z"/>
            </svg>
            <span>Orders</span>
          </div>
        </div>

        <!-- Bottom Section -->
        <div style="
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          background: #fff;
        ">
          ${isAuthenticated ? `
            <div id="nav-profile" style="
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 14px 16px;
              cursor: pointer;
              transition: all 0.2s;
              border-radius: 12px;
              color: #374151;
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 12px;
            " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Profile</span>
            </div>
          ` : `
            <button id="nav-signin" style="
              width: 100%;
              background: linear-gradient(135deg, #2ECC71, #27AE60);
              color: white;
              border: none;
              padding: 14px 20px;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
            " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(46, 204, 113, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(46, 204, 113, 0.2)'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Sign In</span>
            </button>
          `}
        </div>
      `;
      
      // Add click event listeners with proper navigation
      const setupEventListeners = () => {
        document.getElementById('close-drawer')?.addEventListener('click', (e) => {
          e.preventDefault();
          closeDrawer();
        });
        
        document.getElementById('nav-home')?.addEventListener('click', (e) => {
          e.preventDefault();
          navigation.navigate('Home');
          closeDrawer();
        });
        
        document.getElementById('nav-products')?.addEventListener('click', (e) => {
          e.preventDefault();
          navigation.navigate('Products');
          closeDrawer();
        });
        
        document.getElementById('nav-orders')?.addEventListener('click', (e) => {
          e.preventDefault();
          navigation.navigate('Orders');
          closeDrawer();
        });
        
        if (isAuthenticated) {
          document.getElementById('nav-profile')?.addEventListener('click', (e) => {
            e.preventDefault();
            navigation.navigate('Profile');
            closeDrawer();
          });
        } else {
          document.getElementById('nav-signin')?.addEventListener('click', (e) => {
            e.preventDefault();
            navigation.navigate('Login');
            closeDrawer();
          });
        }
      };
      
      document.body.appendChild(drawer);
      
      // Setup event listeners after DOM insertion
      requestAnimationFrame(setupEventListeners);
      
      return () => {
        const existingDrawer = document.getElementById('native-drawer');
        if (existingDrawer) {
          existingDrawer.remove();
        }
      };
    }
  }, [drawerVisible, showMobileMenu, isAuthenticated, navigation]);

  // Add web gesture support via DOM events
  useEffect(() => {
    if (Platform.OS === 'web' && showMobileMenu && typeof document !== 'undefined') {
      let startX = 0;
      let isDragging = false;

      const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        isDragging = false;
        
        // Only trigger from left edge if drawer is closed, or anywhere if drawer is open
        if (!drawerVisible && startX < 50) {
          isDragging = true;
        } else if (drawerVisible) {
          isDragging = true;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;
        
        const drawer = document.getElementById('native-drawer');
        if (drawer) {
          if (!drawerVisible && deltaX > 0) {
            // Opening gesture
            const translateX = Math.min(0, -280 + deltaX);
            drawer.style.transform = `translateX(${translateX}px)`;
          } else if (drawerVisible && deltaX < 0) {
            // Closing gesture
            const translateX = Math.max(-280, deltaX);
            drawer.style.transform = `translateX(${translateX}px)`;
          }
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;
        const drawer = document.getElementById('native-drawer');
        
        if (!drawerVisible) {
          // Opening gesture
          if (deltaX > 100) {
            openDrawer();
          } else if (drawer) {
            drawer.style.transform = 'translateX(-280px)';
          }
        } else {
          // Closing gesture
          if (deltaX < -100) {
            closeDrawer();
          } else if (drawer) {
            drawer.style.transform = 'translateX(0px)';
          }
        }
        
        isDragging = false;
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [drawerVisible, showMobileMenu]);

  // Mobile: minimal header without drawer functionality
  if (isMobile) {
    return (
      <View style={[webHeaderStyles.webHeader, {
        paddingHorizontal: spacing.md,
        height: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
      }]}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* Left - Logo */}
          <TouchableOpacity 
            style={[webHeaderStyles.webLogo, { marginLeft: 0 }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="storefront" size={24} color={colors.primary} />
            <Text style={[webHeaderStyles.webLogoText, { fontSize: 18 }]}>YorkMart</Text>
          </TouchableOpacity>

          {/* Right - Cart only (no sign in) */}
          <DesktopCartIcon navigation={navigation} />
        </View>
      </View>
    );
  }

  // Web: full header with drawer functionality
  return (
    <View 
      style={{ position: 'relative' }}
      {...(Platform.OS !== 'web' ? panResponder.panHandlers : {})}
    >
      {/* Main Header */}
      <View style={[webHeaderStyles.webHeader, {
        paddingHorizontal: spacing.md,
        height: showMobileMenu ? 60 : 70,
        position: 'relative',
        zIndex: 100,
      }]}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* Leftmost - Hamburger Menu (when mobile) */}
          {showMobileMenu && (
            <View style={{ minWidth: 48, justifyContent: 'flex-start' }}>
              <IconButton
                icon="menu"
                size={24}
                iconColor={colors.dark}
                onPress={openDrawer}
                style={{ margin: 0 }} // Remove margins to get truly leftmost
              />
            </View>
          )}
          
          {/* Center/Left - Logo */}
          <View style={{ 
            flex: 1, 
            flexDirection: 'row',
            justifyContent: showMobileMenu ? 'center' : 'flex-start',
            alignItems: 'center' 
          }}>
            <TouchableOpacity 
              style={[webHeaderStyles.webLogo, { marginLeft: showMobileMenu ? 0 : spacing.md }]}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="storefront" size={showMobileMenu ? 24 : 28} color={colors.primary} />
              {(!showMobileMenu || dimensions.width >= 400) && (
                <Text style={[webHeaderStyles.webLogoText, {
                  fontSize: showMobileMenu ? 18 : 20,
                }]}>YorkMart</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Center - Desktop/Tablet Navigation Links */}
          {!showMobileMenu && (
            <View style={[webHeaderStyles.webNav, { flex: 1, justifyContent: 'center' }]}>
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
              <TouchableOpacity 
                style={webHeaderStyles.webNavItem}
                onPress={() => navigation.navigate('Admin')}
              >
                <Text style={webHeaderStyles.webNavText}>Admin</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right side - Cart & Profile */}
          <View style={[webHeaderStyles.webActions, {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }]}>
            <DesktopCartIcon navigation={navigation} />
            
            {/* Only show profile/signin on desktop, not mobile menu */}
            {!showMobileMenu && (
              <>
                {isAuthenticated ? (
                  <TouchableOpacity 
                    style={[webHeaderStyles.webActionItem, {
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: spacing.sm,
                    }]}
                    onPress={() => navigation.navigate('Profile')}
                  >
                    <Ionicons name="person" size={24} color={colors.dark} />
                    <Text style={webHeaderStyles.webActionText}>Profile</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[webHeaderStyles.webLoginButton, {
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    }]}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={webHeaderStyles.webLoginText}>Sign In</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>


      {/* No mobile drawer - mobile uses bottom tabs instead */}

    </View>
  );
};

// Drawer styles
const drawerItemStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
};

const drawerTextStyle = {
  fontSize: 16,
  color: colors.dark,
  fontWeight: '500' as const,
};

// Mobile Header Styles
const styles = StyleSheet.create({
  mobileHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: spacing.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  desktopCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  desktopCartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Mobile Header Component
const MobileHeader = () => (
  <View style={styles.mobileHeader}>
    <View style={styles.brandSection}>
      <Ionicons name="storefront" size={24} color={colors.primary} />
      <Text style={styles.brandText}>YorkMart</Text>
    </View>
  </View>
);

// Cart Icon with Badge Component
const CartIconWithBadge = ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
  const { items } = useSelector((state: RootState) => state.cart);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const iconName = focused ? "basket" : "basket-outline";
  
  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name={iconName} size={size} color={color} />
      {totalItems > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>
            {totalItems > 99 ? '99+' : totalItems.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

// Mobile Tab Navigator
const CustomerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        switch (route.name) {
          case "Home":
            return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
          case "Products":
            return <Ionicons name={focused ? "grid" : "grid-outline"} size={size} color={color} />;
          case "Cart":
            return <CartIconWithBadge focused={focused} color={color} size={size} />;
          case "Orders":
            return <Ionicons name={focused ? "receipt" : "receipt-outline"} size={size} color={color} />;
          case "Profile":
            return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
          default:
            return <Ionicons name="help-outline" size={size} color={color} />;
        }
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray,
      headerShown: true,
      header: () => <MobileHeader />,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Products" component={ProductsScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Stack Navigator with Responsive Header (for both web and mobile with header)
const StackWithHeaderNavigator = () => {
  return (
    <View style={webHeaderStyles.webLayout}>
      <ResponsiveHeader />
      <View style={[webHeaderStyles.webContent, {
        paddingTop: 0, // Remove extra padding since header is responsive
      }]}>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="Home"
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
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
  const { isDesktop } = useResponsive();

  if (user?.role === "driver") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
      </Stack.Navigator>
    );
  }

  // Use screen size instead of platform to determine navigation type
  // Desktop screens (>768px) use header navigation, mobile screens (≤768px) use bottom tabs
  if (isDesktop) {
    // Desktop: Stack navigator with header, no tabs
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CustomerTabs" component={StackWithHeaderNavigator} />
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

  // Mobile and mobile web: Tab navigator at bottom
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

