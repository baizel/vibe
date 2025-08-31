import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, commonStyles } from '../styles/globalStyles';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={[commonStyles.centerContent, { backgroundColor: colors.background }]}>
        {/* Coming Soon Icon */}
        <View style={[commonStyles.centered, { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary + '20', marginBottom: 32 }]}>
          <Ionicons name="lock-closed" size={50} color={colors.primary} />
        </View>
        
        {/* Title */}
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
          Login Coming Soon
        </Text>
        
        {/* Subtitle */}
        <Text style={[commonStyles.bodyText, { textAlign: 'center', marginBottom: 40, paddingHorizontal: 40, color: colors.gray }]}>
          User authentication and login features are currently in development. 
          For now, you can browse products and explore the app as a guest.
        </Text>
        
        {/* Go Back Button */}
        <TouchableOpacity 
          style={[commonStyles.primaryButton, { flexDirection: 'row', alignItems: 'center' }]} 
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
          <Text style={[commonStyles.primaryButtonText, { marginLeft: 8 }]}>
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;