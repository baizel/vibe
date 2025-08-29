import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../store/store";
import { createOrder } from "../store/orderSlice";
import { clearCart } from "../store/cartSlice";

const CheckoutScreen: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { items, total } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Mock data - in real app, fetch from user profile
  const addresses = [
    {
      id: "1",
      name: "Home",
      address: "123 Main Street, London, SW1A 1AA",
      isDefault: true,
    },
    {
      id: "2",
      name: "Work",
      address: "456 Business Ave, London, EC1A 1BB",
      isDefault: false,
    },
  ];

  const deliveryDates = [
    { date: "2024-01-15", label: "Tomorrow", available: true },
    { date: "2024-01-16", label: "Wednesday", available: true },
    { date: "2024-01-17", label: "Thursday", available: false },
    { date: "2024-01-18", label: "Friday", available: true },
  ];

  const placeOrder = async () => {
    setIsPlacingOrder(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        addressId: addresses[selectedAddress].id,
        deliveryDate: deliveryDates[selectedDeliveryDate].date,
        paymentMethod: "cash_on_delivery",
        totalAmount: total,
      };

      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());

      Alert.alert(
        "Order Placed!",
        "Your order has been placed successfully. You can track it in the Orders section.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Orders"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View />
      </View>

      <ScrollView style={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.map((address, index) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress === index && styles.selectedAddressCard,
              ]}
              onPress={() => setSelectedAddress(index)}
            >
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>{address.name}</Text>
                {selectedAddress === index && (
                  <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
                )}
              </View>
              <Text style={styles.addressText}>{address.address}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Date</Text>
          {deliveryDates.map((date, index) => (
            <TouchableOpacity
              key={date.date}
              style={[
                styles.dateCard,
                !date.available && styles.disabledDateCard,
                selectedDeliveryDate === index &&
                  date.available &&
                  styles.selectedDateCard,
              ]}
              onPress={() => date.available && setSelectedDeliveryDate(index)}
              disabled={!date.available}
            >
              <Text
                style={[
                  styles.dateLabel,
                  !date.available && styles.disabledDateLabel,
                  selectedDeliveryDate === index &&
                    date.available &&
                    styles.selectedDateLabel,
                ]}
              >
                {date.label}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  !date.available && styles.disabledDateText,
                ]}
              >
                {date.date}
              </Text>
              {selectedDeliveryDate === index && date.available && (
                <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.orderItem}>
              <Text style={styles.orderItemName}>{item.product.name}</Text>
              <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>
                £{(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalText}>
              Total: £{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Ionicons name="cash-outline" size={24} color="#2ECC71" />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            isPlacingOrder && styles.disabledButton,
          ]}
          onPress={placeOrder}
          disabled={isPlacingOrder}
        >
          <Text style={styles.placeOrderButtonText}>
            {isPlacingOrder
              ? "Placing Order..."
              : `Place Order - £${total.toFixed(2)}`}
          </Text>
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
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2ECC71",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 15,
  },
  itemTotal: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  removeButton: {
    padding: 5,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: "#2ECC71",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  shopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  checkoutButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Checkout Screen Styles
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  addressCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedAddressCard: {
    borderColor: "#2ECC71",
    backgroundColor: "#F0FFF4",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addressText: {
    fontSize: 14,
    color: "#666",
  },
  dateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedDateCard: {
    borderColor: "#2ECC71",
    backgroundColor: "#F0FFF4",
  },
  disabledDateCard: {
    backgroundColor: "#F8F8F8",
    opacity: 0.5,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedDateLabel: {
    color: "#2ECC71",
  },
  disabledDateLabel: {
    color: "#999",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  disabledDateText: {
    color: "#999",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 10,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  orderTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 15,
    marginTop: 15,
  },
  orderTotalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
    color: "#2ECC71",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#2ECC71",
    backgroundColor: "#F0FFF4",
    borderRadius: 12,
  },
  paymentText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
  },
  placeOrderButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#BDC3C7",
  },
  placeOrderButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
