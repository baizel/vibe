// src/types/navigation.ts - Navigation Type Definitions
import { NavigatorScreenParams } from '@react-navigation/native';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  unit: string;
}

export type RootStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  DriverTabs: undefined;
  ProductDetail: { product: Product };
  Checkout: undefined;
  OrderTracking: { orderId: string };
};

export type CustomerTabParamList = {
  Home: undefined;
  Products: { category?: string };
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type DriverTabParamList = {
  Dashboard: undefined;
  Routes: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}