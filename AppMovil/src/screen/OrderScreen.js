import React from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import config from '../../src/config/config'; // Import the configuration file
import { getClientId } from '../globalVariables/clientID';

const ip = config.ip;

export default function OrderScreen({ route, navigation }) {
    const { cartData } = route.params;
  
    const groupedCartData = cartData.reduce((acc, dish) => {
      if (!acc[dish.id_plato]) {
        acc[dish.id_plato] = { ...dish, quantity: 1 };
      } else {
        acc[dish.id_plato].quantity++;
      }
      return acc;
    }, {});
  
    const sendOrderToAPI = () => {
      const clientId = getClientId(); // Retrieve the client ID
      // Prepare order data
      const orderData = {
        client_id: clientId, // Add the client ID to the order data
        platos: Object.values(groupedCartData).map(dish => dish.id_plato) // Extract dish IDs from groupedCartData
      };
  
      // Send POST request to API for placing the order
      fetch(`http://${ip}:5000/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      .then(response => {
        if (response.ok) {
            response.json().then(data => {
              const { order_id } = data; // Access 'order_id' directly
              Alert.alert('Pedido realizado', 'Se ha realizado el pedido con éxito');
              navigation.navigate('ReceiptScreen', { orderId: order_id }); // Pass 'order_id' to 'ReceiptScreen'
            });
          } else {
          Alert.alert('Error', 'No se pudo completar la compra.');
        }
      })
      
    };
  
    const calculateTotalPrice = () => {
      const totalPrice = Object.values(groupedCartData).reduce((total, dish) => {
        return total + (dish.precio * dish.quantity);
      }, 0);
      return totalPrice.toFixed(2);
    };
  
    return (
      <ScrollView>
        <View style={{ margin: 20 }}>
          {Object.values(groupedCartData).map((dish, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text>{dish.nombre_plato} - Cantidad: {dish.quantity} - Precio unitario: ${dish.precio}</Text>
            </View>
          ))}
          <View style={{ marginTop: 20 }}>
            <Text>Total: ${calculateTotalPrice()}</Text>
          </View>
          <View style={{ marginTop: 20 }}>
            <Button title="Confirmar pedido" onPress={sendOrderToAPI} />
          </View>
        </View>
      </ScrollView>
    );
  }
  