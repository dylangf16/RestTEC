import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Button, Alert } from 'react-native';
import config from '../../src/config/config'; // Import the configuration file

const ip = config.ip;

export default function MenuScreen({ navigation }) {
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = () => {
    fetch('http://' + ip + ':5000/dishes')
      .then(response => response.json())
      .then(data => {
        setDishes(data.dishes);
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'Failed to fetch menu.');
      });
  };

  const addToCart = (dishID) => {
    const newCart = [...cart, dishID]; // Add the selected dish ID to the cart
    setCart(newCart);
    Alert.alert('Success', 'Item added to cart successfully.');
  };

  const removeFromCart = (dishID) => {
    const updatedCart = cart.filter(id => id !== dishID); // Remove the dish from the cart
    setCart(updatedCart);
    Alert.alert('Success', 'Item removed from cart successfully.');
  };

  const isItemInCart = (dishID) => {
    return cart.includes(dishID);
  };

  const getCartItemQuantity = (dishID) => {
    return cart.filter(id => id === dishID).length; // Count the quantity of the specific dish in the cart
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <View style={styles.buttonContainer}>
        <Button title="Realizar pedido" onPress={() => navigation.navigate('OrderScreen', { cartData: cart })} />
      </View>
      <View style={styles.menuContainer}>
        {dishes.map((dish, index) => (
          <View key={index} style={styles.dishContainer}>
          <Text>Nombre: {dish.nombre_plato}</Text>
          <Text>Descripción: {dish.descripcion}</Text>
          <Text>Precio: ${dish.precio}</Text>
          <Text>Tipo: {dish.tipo}</Text>
          <Text>Calorias: {dish.calorias}</Text>
          <Text>En carrito: {getCartItemQuantity(dish.id_plato)}</Text>
          <Button
            title="Añadir al carrito"
            onPress={() => addToCart(dish.id_plato)}
          />
          {isItemInCart(dish.id_plato) && (
            <Button title="Remover del carrito" onPress={() => removeFromCart(dish.id_plato)} />
          )}
        </View>
        ))}
      </View>
    </ScrollView>
  );
}

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
  menuContainer: {
    width: '80%',
    marginBottom: 20,
  },
  dishContainer: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
