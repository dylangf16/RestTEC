import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import ShoppingScreen from './src/screen/ShoppingScreen';
import OrderScreen from './src/screen/OrderScreen';
import ReceiptScreen from './src/screen/ReceiptScreen';
import ActiveOrdersScreen from './src/screen/ActiveOrdersScreen';
import HomeScreen from './src/screen/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name = "LoginScreen" component = {LoginScreen} options = {{}} />
        <Stack.Screen name = "HomeScreen" component = {HomeScreen} options = {{}} />
        <Stack.Screen name = "RegisterScreen" component = {RegisterScreen} options = {{}} />
        <Stack.Screen name = "ShoppingScreen" component = {ShoppingScreen} options = {{}} />
        <Stack.Screen name = "OrderScreen" component = {OrderScreen} options = {{}} />
        <Stack.Screen name = "ReceiptScreen" component = {ReceiptScreen} options = {{}} />
        <Stack.Screen name = "ActiveOrdersScreen" component = {ActiveOrdersScreen} options = {{}} />
      </Stack.Navigator>

    </NavigationContainer>
  );
}
