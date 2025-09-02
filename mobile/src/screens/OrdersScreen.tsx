// src/screens/OrdersScreen.tsx - Orders Screen (Placeholder)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you place orders, they'll appear here
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    minHeight: 400,
  },
  emptyIcon: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 12,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  shopButton: {
    paddingHorizontal: 8,
  },
});

export default OrdersScreen;