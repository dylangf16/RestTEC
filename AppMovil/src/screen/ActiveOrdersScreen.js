import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  ScrollView,
  Button,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getClientId} from '../globalVariables/clientID';
import CustomProgressBar from '../customComponents/CustomProgressBar'; // Import the custom progress bar component

const StateScreen = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const clientId = getClientId();
  const navigation = useNavigation();

  useEffect(() => {
    fetchActiveOrders();
  });

  const fetchActiveOrders = () => {
    fetch(`http://10.0.2.2:5274/orders/${clientId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          throw new Error(`client with ID ${clientId} not found`);
        } else {
          throw new Error(
            `Failed to fetch order details for client ID ${clientId}`,
          );
        }
      })
      .then(data => {
        setActiveOrders(data); // data is a JSON array of orders
      })
      .catch(error => {
        console.error('Error fetching active orders:', error);
        Alert.alert('Error', error.message); // Show the error message from the caught error
      });
  };

  const calculateProgress = order => {
    const currentTime = new Date().getTime(); // No need to adjust to CST
    const startTime = new Date(order.OrderTakenAt).getTime();

    // Calculate total duration by summing tiempoEstimado of each plato
    // Convert tiempoEstimado from minutes to milliseconds
    const totalDuration =
      order.platos.reduce(
        (total, plato) => total + plato.tiempoEstimado * 60,
        0,
      ) * 1000;

    const elapsedTime = currentTime - startTime;

    let progress = (elapsedTime / totalDuration) * 100;

    progress = Math.min(100, Math.max(0, progress));

    return progress;
  };

  const calculateEndTime = order => {
    const startTime = new Date(order.OrderTakenAt).getTime();

    // Calculate total duration by summing tiempoEstimado of each plato
    // Convert tiempoEstimado from minutes to milliseconds
    const totalDuration =
      order.platos.reduce(
        (total, plato) => total + plato.tiempoEstimado * 60,
        0,
      ) * 1000;

    const endTime = startTime + totalDuration;

    return endTime;
  };

  // Format the date of realization
  const formatDate = dateString => {
    const options = {year: 'numeric', month: '2-digit', day: '2-digit'};
    const date = new Date(dateString).toLocaleDateString(undefined, options);
    const time = new Date(dateString).toLocaleTimeString();
    return `${date} ${time}`;
  };

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pedidos Activos</Text>
        <View style={styles.formContainer}>
          {activeOrders.map(order => {
            const progress = calculateProgress(order);
            return (
              <View key={order.id_pedido} style={styles.orderContainer}>
                <Text style={styles.orderText}>
                  ID del pedido: {order.id_orden}
                </Text>
                <Text style={styles.orderText}>
                  Fecha de realización del pedido:{' '}
                  {formatDate(order.OrderTakenAt)}
                </Text>
                <Text style={styles.orderText}>
                  Hora estimada de finalización:{' '}
                  {new Date(calculateEndTime(order)).toLocaleTimeString()}
                </Text>
                <Text style={styles.orderText}>Platos:</Text>
                {order.platos.map((plato, index) => (
                  <Text key={index} style={styles.orderText}>
                    {' '}
                    {plato.cantidad} x {plato.nombre_plato}
                  </Text>
                ))}
                <CustomProgressBar progress={progress} />
                {progress === 100 && (
                  <Button
                    title="Qué te pareció tu pedido!"
                    onPress={() =>
                      navigation.navigate('FeedbackScreen', {order})
                    }
                    color="#800080" // Purple
                  />
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Volver a inicio"
            onPress={() => navigation.navigate('HomeScreen')}
            color="#800080" // Purple
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
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
    color: '#000', // Black
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
  },
});

export default StateScreen;
