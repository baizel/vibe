import React from "react";
import {
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  Text,
  Button,
  Surface,
  IconButton,
} from "react-native-paper";
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
      <View style={[commonStyles.centerContent, { backgroundColor: '#f5f5f5' }]}>
        <Surface style={comingSoonStyles.container} elevation={2}>
          {/* Coming Soon Icon */}
          <IconButton
            icon="credit-card"
            size={64}
            iconColor={colors.primary}
            style={comingSoonStyles.icon}
          />
          
          {/* Title */}
          <Text variant="headlineMedium" style={comingSoonStyles.title}>
            Checkout Coming Soon
          </Text>
          
          {/* Subtitle */}
          <Text variant="bodyLarge" style={comingSoonStyles.subtitle}>
            Order checkout, payment processing, and delivery features are currently in development.
          </Text>
          
          {/* Action Buttons */}
          <View style={comingSoonStyles.buttonContainer}>
            <Button 
              mode="contained"
              onPress={() => navigation.navigate('Products')}
              icon="storefront"
              style={comingSoonStyles.primaryButton}
              buttonColor={colors.primary}
            >
              Continue Shopping
            </Button>
            
            <Button 
              mode="outlined"
              onPress={handleGoBack}
              icon="arrow-left"
              style={comingSoonStyles.secondaryButton}
            >
              Go Back
            </Button>
          </View>
        </Surface>
      </View>
    </SafeAreaView>
  );
};

const comingSoonStyles = {
  container: {
    padding: 40,
    margin: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center' as const,
  },
  icon: {
    backgroundColor: colors.primary + '20',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: 16,
    color: '#1a1a1a',
  },
  subtitle: {
    textAlign: 'center' as const,
    marginBottom: 32,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    borderColor: colors.primary,
  },
};

export default CheckoutScreen;