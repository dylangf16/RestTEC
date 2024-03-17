import React from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import {getClientId} from '../globalVariables/clientID';

export default function OrderScreen({route, navigation}) {
  const {cartData} = route.params;

  const sendOrderToAPI = async () => {
    const clientId = getClientId(); // Retrieve the client ID
    const montoTotal = calculateTotalPrice();
    // Prepare order data
    const orderData = {
      id_cliente: clientId, // Change 'client_id' to 'id_cliente'
      platos: cartData, // Send the complete 'Dish' objects
      total: montoTotal,
    };

    try {
      // Send POST request to API for placing the order
      const response = await fetch('http://10.0.2.2:5274/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        const {order_id} = data; // Access 'order_id' directly
        Alert.alert('Pedido realizado', 'Se ha realizado el pedido con éxito');
        navigation.navigate('ReceiptScreen', {orderId: order_id}); // Pass 'order_id' to 'ReceiptScreen'
      } else {
        Alert.alert('Error', 'No se pudo completar la compra.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo completar la compra.');
    }
  };

  const calculateTotalPrice = () => {
    const totalPrice = Object.values(cartData).reduce((total, dish) => {
      return total + dish.precio * dish.cantidad;
    }, 0);
    return totalPrice;
  };

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>Resumen del Pedido</Text>
          {Object.values(cartData).map((dish, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemText}>{dish.nombre_plato}</Text>
              <Text style={styles.itemText}>Cantidad: {dish.cantidad}</Text>
              <Text style={styles.itemText}>
                Precio unitario: ${dish.precio}
              </Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Total: ${calculateTotalPrice().toFixed(2)}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Confirmar pedido"
              onPress={sendOrderToAPI}
              color="#800080"
            />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
  },
});
