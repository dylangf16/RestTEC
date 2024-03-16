import React from 'react';
import { View, Text, Button, ScrollView, Alert, StyleSheet } from 'react-native';
import { getClientId } from '../globalVariables/clientID';

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
  
    const sendOrderToAPI = async () => {
      const clientId = getClientId(); // Retrieve the client ID
      // Prepare order data
      const orderData = {
        id_cliente: clientId, // Change 'client_id' to 'id_cliente'
        platos: cartData // Send the complete 'Dish' objects
      };
    
      try {
        // Send POST request to API for placing the order
        const response = await fetch(`http://10.0.2.2:5274/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
    
        if (response.ok) {
          const data = await response.json();
          const { order_id } = data; // Access 'order_id' directly
          Alert.alert('Pedido realizado', 'Se ha realizado el pedido con éxito');
          navigation.navigate('ReceiptScreen', { orderId: order_id }); // Pass 'order_id' to 'ReceiptScreen'
        } else {
          Alert.alert('Error', 'No se pudo completar la compra.');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'No se pudo completar la compra.');
      }
    };
    
  
    const calculateTotalPrice = () => {
      const totalPrice = Object.values(groupedCartData).reduce((total, dish) => {
        return total + (dish.precio * dish.quantity);
      }, 0);
      return totalPrice.toFixed(2);
    };
  
    return (
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Resumen del Pedido</Text>
          {Object.values(groupedCartData).map((dish, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemText}>{dish.nombre_plato}</Text>
              <Text style={styles.itemText}>Cantidad: {dish.quantity}</Text>
              <Text style={styles.itemText}>Precio unitario: ${dish.precio}</Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ${calculateTotalPrice()}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Confirmar pedido" onPress={sendOrderToAPI} />
          </View>
        </View>
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
  },
  totalContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
  },
});
