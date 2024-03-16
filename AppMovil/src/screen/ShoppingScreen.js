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

  const addToCart = (dishID, dishName, dishPrice) => {
    const dishData = {
        nombre_plato: dishName,
        precio: dishPrice,
        id_plato: dishID
      };
    const newCart = [...cart, dishData]; // Add the selected dish ID to the cart
    setCart(newCart);
  };

  const removeFromCart = (dishID) => {
    const indexToRemove = cart.findIndex(dish => dish.id_plato === dishID); // Find the index of the dish to remove
    if (indexToRemove !== -1) {
      const updatedCart = [...cart.slice(0, indexToRemove), ...cart.slice(indexToRemove + 1)]; // Remove the dish from the cart
      setCart(updatedCart);
    } else {
      Alert.alert('Error', 'Item not found in cart.');
    }
  };
  
  const isItemInCart = (dishID) => {
    return cart.some(dish => dish.id_plato === dishID);
  };
  
  const getCartItemQuantity = (dishID) => {
    return cart.reduce((total, dish) => {
      return dish.id_plato === dishID ? total + 1 : total;
    }, 0);
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <View style={styles.buttonContainer}>
        <Button title="Ver mi pedido" onPress={() => navigation.navigate('OrderScreen', { cartData: cart })} />
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
          <View style={styles.buttonContainer}>
          <Button
            title="Añadir al carrito"
            color = "green"
            onPress={() => addToCart(dish.id_plato, dish.nombre_plato, dish.precio)}/>
          </View>
          {isItemInCart(dish.id_plato) && (
            <View style={styles.buttonContainer}>
            <Button title="Remover del carrito" onPress={() => removeFromCart(dish.id_plato)} 
            color = "red"
            />
            </View>
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
    marginTop: 15,
    marginBottom: 15,
  },
});
