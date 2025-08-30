import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, commonStyles } from "../styles/globalStyles";

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleComingSoon = () => {
    Alert.alert(
      'Checkout Coming Soon',
      'Order checkout and payment features are currently in development.',
      [
        { text: 'Continue Shopping', onPress: () => navigation.navigate('Products') },
        { text: 'OK' }
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.centerContent, { backgroundColor: colors.background }]}>
        {/* Coming Soon Icon */}
        <View style={[commonStyles.centered, { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary + '20', marginBottom: 32 }]}>
          <Ionicons name="card" size={50} color={colors.primary} />
        </View>
        
        {/* Title */}
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
          Checkout Coming Soon
        </Text>
        
        {/* Subtitle */}
        <Text style={[commonStyles.bodyText, { textAlign: 'center', marginBottom: 40, paddingHorizontal: 40, color: colors.gray }]}>
          Order checkout, payment processing, and delivery features are currently in development.
        </Text>
        
        {/* Action Buttons */}
        <View style={{ width: '100%', paddingHorizontal: 40 }}>
          <TouchableOpacity 
            style={[commonStyles.primaryButton, { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }]} 
            onPress={() => navigation.navigate('Products')}
          >
            <Ionicons name="storefront" size={24} color={colors.white} />
            <Text style={[commonStyles.primaryButtonText, { marginLeft: 8 }]}>
              Continue Shopping
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[commonStyles.secondaryButton, { flexDirection: 'row', alignItems: 'center' }]} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={[commonStyles.secondaryButtonText, { marginLeft: 8 }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;