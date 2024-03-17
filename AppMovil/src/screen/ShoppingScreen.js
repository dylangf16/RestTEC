import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  Alert,
  ImageBackground,
} from 'react-native';

export default function MenuScreen({navigation}) {
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = () => {
    fetch('http://10.0.2.2:5274/dishes')
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
    const existingDishIndex = cart.findIndex(dish => dish.id_plato === dishID);
    if (existingDishIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingDishIndex].cantidad++; // Increase quantity if the dish already exists in the cart
      setCart(updatedCart);
    } else {
      const newCart = [
        ...cart,
        {
          id_plato: dishID,
          nombre_plato: dishName,
          precio: dishPrice,
          cantidad: 1,
        },
      ];
      setCart(newCart);
    }
  };

  const removeFromCart = dishID => {
    const existingDishIndex = cart.findIndex(dish => dish.id_plato === dishID);
    if (existingDishIndex !== -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingDishIndex].cantidad > 1) {
        updatedCart[existingDishIndex].cantidad--; // Decrease quantity if more than one item exists
      } else {
        updatedCart.splice(existingDishIndex, 1); // Remove the dish from the cart if only one item exists
      }
      setCart(updatedCart);
    } else {
      Alert.alert('Error', 'Item not found in cart.');
    }
  };
  const isItemInCart = dishID => {
    return cart.some(dish => dish.id_plato === dishID);
  };

  const getCartItemQuantity = dishID => {
    return cart.reduce((total, dish) => {
      return dish.id_plato === dishID ? total + dish.cantidad : total;
    }, 0);
  };

  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Menú</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Ver mi pedido"
            color="#841584"
            onPress={() => navigation.navigate('OrderScreen', {cartData: cart})}
          />
        </View>
        <View style={styles.menuContainer}>
          {dishes.map((dish, index) => (
            <View key={index} style={styles.dishContainer}>
              <Text style={styles.dishTitle}>Nombre: {dish.nombre_plato}</Text>
              <Text style={styles.dishDetail}>
                Descripción: {dish.descripcion}
              </Text>
              <Text style={styles.dishDetail}>Precio: ${dish.precio}</Text>
              <Text style={styles.dishDetail}>Tipo: {dish.tipo}</Text>
              <Text style={styles.dishDetail}>Calorías: {dish.calorias}</Text>
              <Text style={styles.dishDetail}>
                En carrito: {getCartItemQuantity(dish.id_plato)}
              </Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="Añadir al carrito"
                  color="#6E8B3D" // Dark olive green
                  onPress={() =>
                    addToCart(dish.id_plato, dish.nombre_plato, dish.precio)
                  }
                />
              </View>
              {isItemInCart(dish.id_plato) && (
                <View style={styles.buttonContainer}>
                  <Button
                    title="Remover del carrito"
                    onPress={() => removeFromCart(dish.id_plato)}
                    color="#8B0000" // Dark red
                  />
                </View>
              )}
            </View>
          ))}
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonContainer: {
    marginTop: 15,
    marginBottom: 15,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dishTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dishDetail: {
    marginBottom: 5,
  },
});
