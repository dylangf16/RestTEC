import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  ImageBackground,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export default function ReceiptScreen({route}) {
  const {orderId} = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchOrderDetails(orderId);
  });

  const fetchOrderDetails = orderId => {
    fetch(`http://10.0.2.2:5274/order/${orderId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          throw new Error(`Order with ID ${orderId} not found`);
        } else {
          throw new Error(
            `Failed to fetch order details for order ID ${orderId}`,
          );
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
  const dateTime = new Date(orderDetails.OrderTakenAt);
  const formattedDate = dateTime.toLocaleDateString();
  const formattedTime = dateTime.toLocaleTimeString();

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.title}>Factura</Text>
        <View style={styles.receiptContainer}>
          <Text>ID del pedido: {orderDetails.id_orden}</Text>
          <Text>Fecha: {formattedDate}</Text>
          <Text>Hora: {formattedTime}</Text>
          <Text style={styles.platoHeader}>Platos:</Text>
          {orderDetails.platos.map((plato, index) => (
            <View key={index}>
              <Text style={styles.platoText}>
                {plato.nombre_plato} - Cantidad: {plato.cantidad} - ₡
                {plato.precio}
              </Text>
            </View>
          ))}
          <Text style={styles.totalText}>
            Total: ${orderDetails.total}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Volver a inicio"
            onPress={() => navigation.navigate('HomeScreen')}
            color="#800080" // Purple
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Ver estado del pedido"
            onPress={() => navigation.navigate('ActiveOrdersScreen')}
            color="#800080" // Purple
          />
        </View>
      </View>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  receiptContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  platoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#800080', // Purple
  },
  platoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#800080', // Purple
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
});
