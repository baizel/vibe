// src/screens/AdminScreen.tsx - Desktop-only Admin Panel
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Text,
  Button,
  IconButton,
  ActivityIndicator,
  Surface,
  Switch,
  Divider,
  Chip,
  Menu,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles/globalStyles";
import { productAPI } from "../services/api";
import { useResponsive } from "../hooks/useResponsive";
import { spacing } from "../utils/responsive";

// Predefined product categories
const PRODUCT_CATEGORIES = [
  'beef',
  'chicken', 
  'pork',
  'lamb',
  'seafood',
  'dairy',
  'vegetables',
  'other'
] as const;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  unit: string;
  isActive?: boolean;
  supplier?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface EditableProduct extends Product {
  isEditing: boolean;
  tempName: string;
  tempPrice: string;
  tempDescription: string;
  tempImageUrl: string;
  tempCategory: string;
  tempUnit: string;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  unit: string;
}

const AdminScreen: React.FC = () => {
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EditableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchById, setSearchById] = useState("");
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    unit: "kg",
  });
  
  const navigation = useNavigation<any>();
  const { isDesktop } = useResponsive();

  // Redirect if not desktop
  useEffect(() => {
    if (!isDesktop) {
      Alert.alert("Access Denied", "Admin panel is only available on desktop", [
        { text: "OK", onPress: () => navigation.navigate("Home") }
      ]);
      return;
    }
  }, [isDesktop, navigation]);

  useEffect(() => {
    if (isDesktop) {
      loadProducts();
    }
  }, [isDesktop]);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery, searchById]);

  useEffect(() => {
    loadCategories();
  }, [products]);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      const productsData = response.content || response;
      
      // Transform products to editable format
      const editableProducts = productsData.map((product: Product) => ({
        ...product,
        isActive: product.isActive ?? true,
        isEditing: false,
        tempName: product.name,
        tempPrice: product.price.toString(),
        tempDescription: product.description,
        tempImageUrl: product.imageUrl,
        tempCategory: product.category,
        tempUnit: product.unit,
      }));
      
      setProducts(editableProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    // Combine predefined categories with existing product categories
    const existingCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
    const allCategories = [...new Set([...PRODUCT_CATEGORIES, ...existingCategories])];
    setCategories(['all', ...allCategories]);
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query (name or description)
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by ID search
    if (searchById) {
      filtered = filtered.filter(product =>
        product.id.toLowerCase().includes(searchById.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const toggleEdit = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            isEditing: !product.isEditing,
            // Reset temp values when canceling edit
            tempName: product.isEditing ? product.name : product.tempName,
            tempPrice: product.isEditing ? product.price.toString() : product.tempPrice,
            tempDescription: product.isEditing ? product.description : product.tempDescription,
            tempImageUrl: product.isEditing ? product.imageUrl : product.tempImageUrl,
            tempCategory: product.isEditing ? product.category : product.tempCategory,
            tempUnit: product.isEditing ? product.unit : product.tempUnit,
          }
        : product
    ));
  };

  const saveProduct = (productId: string) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updatedProduct = {
          ...product,
          name: product.tempName,
          price: parseFloat(product.tempPrice) || product.price,
          description: product.tempDescription,
          imageUrl: product.tempImageUrl,
          category: product.tempCategory,
          unit: product.tempUnit,
          isEditing: false,
        };
        
        // Here you would normally call the backend API
        console.log("Saving product (mock):", updatedProduct);
        Alert.alert("Success", `${updatedProduct.name} updated successfully`);
        
        return updatedProduct;
      }
      return product;
    }));
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isActive: !product.isActive }
        : product
    ));
    
    const product = products.find(p => p.id === productId);
    const status = product?.isActive ? "disabled" : "enabled";
    Alert.alert("Status Updated", `Product ${status} successfully`);
  };

  const updateField = (productId: string, field: keyof EditableProduct, value: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, [field]: value }
        : product
    ));
  };

  const createNewProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      Alert.alert("Error", "Please fill in required fields (name, price, category)");
      return;
    }

    const newProductId = `new-${Date.now()}`;
    const productToCreate: EditableProduct = {
      id: newProductId,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price) || 0,
      imageUrl: newProduct.imageUrl || "https://via.placeholder.com/200x120/E0E0E0/FFFFFF?text=New+Product",
      category: newProduct.category,
      unit: newProduct.unit,
      isActive: true,
      isEditing: false,
      tempName: newProduct.name,
      tempPrice: newProduct.price,
      tempDescription: newProduct.description,
      tempImageUrl: newProduct.imageUrl || "",
      tempCategory: newProduct.category,
      tempUnit: newProduct.unit,
    };

    setProducts(prev => [productToCreate, ...prev]);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      category: "",
      unit: "kg",
    });
    setShowNewProductForm(false);
    
    Alert.alert("Success", `${newProduct.name} created successfully`);
    console.log("Creating new product (mock):", productToCreate);
  };

  const updateNewProductField = (field: keyof NewProduct, value: string) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  // Category Dropdown Component using React Native Paper Menu
  const CategoryDropdown = ({ 
    id,
    value, 
    onValueChange, 
    placeholder = "Select Category" 
  }: { 
    id: string;
    value: string; 
    onValueChange: (value: string) => void;
    placeholder?: string;
  }) => {
    const [visible, setVisible] = React.useState(false);
    
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    
    return (
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity 
            style={styles.dropdownTrigger} 
            onPress={openMenu}
          >
            <Text style={[styles.dropdownText, !value && styles.placeholderText]}>
              {value ? value.charAt(0).toUpperCase() + value.slice(1) : placeholder}
            </Text>
            <Text style={styles.dropdownArrow}>{visible ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        }
        contentStyle={styles.menuContent}
      >
        <ScrollView style={styles.menuScrollView} nestedScrollEnabled={true}>
          {PRODUCT_CATEGORIES.map((category) => (
            <Menu.Item 
              key={category}
              onPress={() => {
                onValueChange(category);
                closeMenu();
              }}
              title={category.charAt(0).toUpperCase() + category.slice(1)}
              titleStyle={value === category ? styles.selectedMenuItemText : styles.menuItemText}
              style={value === category ? styles.selectedMenuItem : styles.menuItemStyle}
            />
          ))}
        </ScrollView>
      </Menu>
    );
  };

  const renderProduct = ({ item }: { item: EditableProduct }) => (
    <Card style={styles.productCard} mode="elevated">
      <View style={styles.productRow}>
        {/* Product Image */}
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        
        {/* Product Details */}
        <View style={styles.productDetails}>
          {item.isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={item.tempName}
                onChangeText={(value) => updateField(item.id, 'tempName', value)}
                placeholder="Product Name *"
                placeholderTextColor="#666"
              />
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={item.tempDescription}
                onChangeText={(value) => updateField(item.id, 'tempDescription', value)}
                placeholder="Description"
                multiline
                numberOfLines={3}
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                value={item.tempImageUrl}
                onChangeText={(value) => updateField(item.id, 'tempImageUrl', value)}
                placeholder="Image URL"
                placeholderTextColor="#666"
              />
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  value={item.tempPrice}
                  onChangeText={(value) => updateField(item.id, 'tempPrice', value)}
                  placeholder="Price *"
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  value={item.tempUnit}
                  onChangeText={(value) => updateField(item.id, 'tempUnit', value)}
                  placeholder="Unit (kg, piece, etc.)"
                  placeholderTextColor="#666"
                />
              </View>
              <CategoryDropdown
                id={`edit-${item.id}`}
                value={item.tempCategory}
                onValueChange={(value) => updateField(item.id, 'tempCategory', value)}
                placeholder="Select Category *"
              />
            </View>
          ) : (
            <View style={styles.viewMode}>
              <Text variant="titleLarge" style={styles.productName}>{item.name}</Text>
              <Text variant="bodySmall" style={styles.productId}>ID: {item.id}</Text>
              <Text variant="bodyMedium" style={styles.productDescription}>{item.description}</Text>
              <View style={styles.productMeta}>
                <Chip icon="currency-gbp" style={styles.priceChip}>
                  £{item.price.toFixed(2)}/{item.unit}
                </Chip>
                <Chip icon="tag" style={styles.categoryChip}>
                  {item.category}
                </Chip>
                <Chip 
                  icon={item.isActive ? "check-circle" : "close-circle"} 
                  style={[styles.statusChip, item.isActive ? styles.activeChip : styles.inactiveChip]}
                >
                  {item.isActive ? "Active" : "Disabled"}
                </Chip>
              </View>
              {item.supplier && (
                <Text variant="bodySmall" style={styles.supplierInfo}>
                  Supplier: {item.supplier.name}
                </Text>
              )}
            </View>
          )}
        </View>
        
        {/* Actions */}
        <View style={styles.productActions}>
          <View style={styles.statusToggle}>
            <Text variant="bodySmall">Available:</Text>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleProductStatus(item.id)}
              color="#2ECC71"
            />
          </View>
          
          <View style={styles.actionButtons}>
            {item.isEditing ? (
              <>
                <Button
                  mode="contained"
                  onPress={() => saveProduct(item.id)}
                  style={[styles.actionButton, styles.saveButton]}
                  labelStyle={styles.buttonText}
                >
                  Save
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => toggleEdit(item.id)}
                  style={styles.actionButton}
                  labelStyle={styles.buttonText}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                mode="contained"
                onPress={() => toggleEdit(item.id)}
                style={[styles.actionButton, styles.editButton]}
                labelStyle={styles.buttonText}
              >
                Edit
              </Button>
            )}
          </View>
        </View>
      </View>
    </Card>
  );

  if (!isDesktop) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>Loading admin panel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineLarge" style={styles.headerTitle}>Admin Panel</Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                Manage products, prices, and delivery schedules
              </Text>
            </View>
            <Chip icon="shield-account" style={styles.adminBadge}>
              Admin Access
            </Chip>
          </View>
        </Surface>

        {/* Search and Filter Controls */}
        <Surface style={styles.searchControls} elevation={1}>
          <View style={styles.searchRow}>
            <View style={styles.searchSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Search & Filter</Text>
              <View style={styles.searchInputs}>
                <TextInput
                  style={[styles.input, styles.searchInput]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name or description..."
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={[styles.input, styles.searchInput]}
                  value={searchById}
                  onChangeText={setSearchById}
                  placeholder="Search by ID..."
                  placeholderTextColor="#666"
                />
              </View>
            </View>
            
            <View style={styles.categorySection}>
              <Text variant="bodyMedium" style={styles.categoryLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    mode={selectedCategory === category ? 'flat' : 'outlined'}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                    style={styles.categoryChip}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          </View>
          
          <View style={styles.actionRow}>
            <Button
              mode="contained"
              onPress={() => setShowNewProductForm(true)}
              style={styles.newProductButton}
              icon="plus"
            >
              Add New Product
            </Button>
            <Text variant="bodyMedium" style={styles.resultCount}>
              Showing {filteredProducts.length} of {products.length} products
            </Text>
          </View>
        </Surface>

        {/* New Product Form */}
        {showNewProductForm && (
          <Surface style={styles.newProductForm} elevation={2}>
            <View style={styles.formHeader}>
              <Text variant="titleLarge" style={styles.formTitle}>Create New Product</Text>
              <Button mode="outlined" onPress={() => setShowNewProductForm(false)}>
                Cancel
              </Button>
            </View>
            
            <View style={styles.formContent}>
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.formInput]}
                  value={newProduct.name}
                  onChangeText={(value) => updateNewProductField('name', value)}
                  placeholder="Product Name *"
                  placeholderTextColor="#666"
                />
                <CategoryDropdown
                  id="new-product"
                  value={newProduct.category}
                  onValueChange={(value) => updateNewProductField('category', value)}
                  placeholder="Select Category *"
                />
              </View>
              
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={newProduct.description}
                onChangeText={(value) => updateNewProductField('description', value)}
                placeholder="Description"
                multiline
                numberOfLines={3}
                placeholderTextColor="#666"
              />
              
              <TextInput
                style={styles.input}
                value={newProduct.imageUrl}
                onChangeText={(value) => updateNewProductField('imageUrl', value)}
                placeholder="Image URL"
                placeholderTextColor="#666"
              />
              
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, styles.formInput]}
                  value={newProduct.price}
                  onChangeText={(value) => updateNewProductField('price', value)}
                  placeholder="Price *"
                  keyboardType="numeric"
                  placeholderTextColor="#666"
                />
                <TextInput
                  style={[styles.input, styles.formInput]}
                  value={newProduct.unit}
                  onChangeText={(value) => updateNewProductField('unit', value)}
                  placeholder="Unit (kg, piece, etc.)"
                  placeholderTextColor="#666"
                />
              </View>
              
              <Button
                mode="contained"
                onPress={createNewProduct}
                style={styles.createButton}
                icon="check"
              >
                Create Product
              </Button>
            </View>
          </Surface>
        )}

        {/* Products List */}
        <View style={styles.productsSection}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <View key={item.id}>
                {renderProduct({ item })}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchQuery || searchById || selectedCategory !== 'all' 
                  ? 'No products match your search criteria' 
                  : 'No products found'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    overflow: 'visible',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    color: "#666",
  },
  header: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "#fff",
    borderRadius: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#1a1a1a",
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#666",
    marginTop: spacing.xs,
  },
  adminBadge: {
    backgroundColor: "#2ECC71",
  },
  searchControls: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "#fff",
    borderRadius: spacing.md,
  },
  searchRow: {
    marginBottom: spacing.lg,
  },
  searchSection: {
    marginBottom: spacing.md,
  },
  searchInputs: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  categorySection: {
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    color: "#666",
    marginBottom: spacing.sm,
  },
  categoryScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  newProductButton: {
    backgroundColor: "#2ECC71",
  },
  resultCount: {
    color: "#666",
  },
  newProductForm: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "#fff",
    borderRadius: spacing.md,
    borderWidth: 2,
    borderColor: "#2ECC71",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  formTitle: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  formContent: {
    gap: spacing.md,
  },
  formRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  formInput: {
    flex: 1,
  },
  createButton: {
    backgroundColor: "#2ECC71",
    marginTop: spacing.sm,
  },
  productsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: "#1a1a1a",
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  productsList: {
    paddingBottom: spacing.xl,
  },
  productCard: {
    backgroundColor: "#fff",
    marginBottom: spacing.md,
    padding: spacing.lg,
    overflow: 'visible',
  },
  productRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
    overflow: 'visible',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: spacing.sm,
    backgroundColor: "#E0E0E0",
  },
  productDetails: {
    flex: 1,
  },
  editForm: {
    gap: spacing.md,
    overflow: 'visible',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: spacing.sm,
    padding: spacing.sm,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  flexInput: {
    flex: 1,
  },
  viewMode: {
    gap: spacing.sm,
  },
  productName: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  productId: {
    color: "#999",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: spacing.xs,
  },
  productDescription: {
    color: "#666",
    lineHeight: 22,
  },
  supplierInfo: {
    color: "#666",
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  productMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  priceChip: {
    backgroundColor: "#E8F5E8",
  },
  categoryChip: {
    backgroundColor: "#FFF3E0",
  },
  statusChip: {
    backgroundColor: "#FFF3E0",
  },
  activeChip: {
    backgroundColor: "#E8F5E8",
  },
  inactiveChip: {
    backgroundColor: "#FFEBEE",
  },
  productActions: {
    alignItems: "flex-end",
    gap: spacing.md,
    minWidth: 180,
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: "#2ECC71",
  },
  editButton: {
    backgroundColor: "#3498DB",
  },
  buttonText: {
    fontSize: 14,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
  },
  // Menu dropdown styles (using React Native Paper Menu)
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: spacing.sm,
    padding: spacing.sm,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  placeholderText: {
    color: "#666",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  menuContent: {
    backgroundColor: "#fff",
    borderRadius: spacing.sm,
    maxHeight: 300,
    minWidth: 200,
  },
  menuScrollView: {
    maxHeight: 280,
  },
  menuItemText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  menuItemStyle: {
    minHeight: 48,
    paddingVertical: 8,
  },
  selectedMenuItem: {
    backgroundColor: "#E8F5E8",
    minHeight: 48,
    paddingVertical: 8,
  },
  selectedMenuItemText: {
    fontSize: 16,
    color: "#2ECC71",
    fontWeight: "600",
  },
});

export default AdminScreen;