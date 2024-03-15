import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import config from '../../src/config/config';

const ip = config.ip;

export default function ReceiptScreen({ route }) {
  const { orderId } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails(orderId);
  }, []);

  const fetchOrderDetails = (orderId) => {
    fetch(`http://${ip}:5000/order/${orderId}`)
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

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Factura</Text>
      <Text>ID del pedido: {orderDetails.id_pedido}</Text>
      <Text>Hora y fecha: {orderDetails.fecha_hora}</Text>
      <Text>Platos:</Text>
      {orderDetails.platos.map((plato, index) => (
        <View key={index}>
          <Text>{plato.nombre_plato} - ${plato.precio}</Text>
        </View>
      ))}
      <Text>Total: ${orderDetails.monto_total}</Text>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
