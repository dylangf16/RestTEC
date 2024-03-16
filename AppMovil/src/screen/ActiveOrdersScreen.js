import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, ScrollView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getClientId } from '../globalVariables/clientID';
import config from '../../src/config/config';
import CustomProgressBar from '../customComponents/CustomProgressBar'; // Import the custom progress bar component

const ip = config.ip;

const StateScreen = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const clientId = getClientId();
  const navigation = useNavigation();

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = () => {
    fetch(`http://${ip}:5000/orders/${clientId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          throw new Error(`client with ID ${clientId} not found`);
        } else {
          throw new Error(`Failed to fetch order details for client ID ${clientId}`);
        }
      })
      .then(data => {
        setActiveOrders(data.orders);
      })
      .catch(error => {
        console.error('Error fetching active orders:', error);
        Alert.alert('Error', error.message); // Show the error message from the caught error
      });
  };

  const calculateProgress = (order) => {
    const currentTime = Date.now();
    const startTime = new Date(order.fecha_hora).getTime();
    const endTime = new Date(order.hora_finalizacion).getTime(); // Assuming this is the end time

    // Calculate total duration of the order in milliseconds
    const totalDuration = endTime - startTime;

    // Calculate elapsed time since the order started
    const elapsedTime = currentTime - startTime;

    // Calculate progress percentage
    let progress = (elapsedTime / totalDuration) * 100;

    // Ensure progress is within the range [0, 100]
    progress = Math.min(100, Math.max(0, progress));

    return progress;
  };

  // Format the date of realization
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString).toLocaleDateString(undefined, options);
    const time = new Date(dateString).toLocaleTimeString();
    return `${date} ${time}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pedidos Activos</Text>
      <View style={styles.formContainer}>
        {activeOrders.map((order) => (
          <View key={order.id_pedido} style={styles.orderContainer}>
            <Text style={styles.orderText}>ID del pedido: {order.id_pedido}</Text>
            <Text style={styles.orderText}>Fecha de realización del pedido: {formatDate(order.fecha_hora)}</Text>
            <Text style={styles.orderText}>Hora estimada de finalización: {new Date(order.hora_finalizacion).toLocaleTimeString()}</Text>
            <Text style={styles.orderText}>Estado del pedido: {order.estado}</Text>
            <Text style={styles.orderText}>Platos:</Text>
            {order.platos.map((plato, index) => (
              <Text key={index} style={styles.orderText}> - {plato.nombre_plato}</Text>
            ))}
            <CustomProgressBar progress={calculateProgress(order)} />
          </View>
        ))}
        <View style={styles.buttonContainer}>
          <Button title="Volver a inicio" onPress={() => navigation.navigate('HomeScreen')} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  formContainer: {
    width: '80%',
  },
  orderContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default StateScreen;
