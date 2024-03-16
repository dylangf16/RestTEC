import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ReceiptScreen({ route }) {
  const { orderId } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchOrderDetails(orderId);
  }, []);

  const fetchOrderDetails = (orderId) => {
    fetch(`http://10.0.2.2:5274/order/${orderId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          throw new Error(`Order with ID ${orderId} not found`);
        } else {
          throw new Error(`Failed to fetch order details for order ID ${orderId}`);
        }
      })
      .then(data => {
        setOrderDetails(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching order details:', error);
        setLoading(false);
        Alert.alert('Error', error.message); // Show the error message from the caught error
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.container}>
        <Text>Error: Failed to fetch order details</Text>
      </View>
    );
  }

  // Format date and time
  const dateTime = new Date(orderDetails.fecha_hora);
  const formattedDate = dateTime.toLocaleDateString();
  const formattedTime = dateTime.toLocaleTimeString();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Factura</Text>
      <Text>ID del pedido: {orderDetails.id_pedido}</Text>
      <Text>Fecha: {formattedDate}</Text>
      <Text>Hora: {formattedTime}</Text>
      <Text>Platos:</Text>
      {orderDetails.platos.map((plato, index) => (
        <View key={index}>
          <Text>{plato.nombre_plato} - Cantidad: {plato.cantidad} - ${plato.precio}</Text>
        </View>
      ))}
      <Text>Total: ${orderDetails.monto_total}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Volver a inicio" onPress={() => navigation.navigate('HomeScreen')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Ver estado del pedido" onPress={() => navigation.navigate('ActiveOrdersScreen')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
});
