import React from 'react';
import {View, Text, Button, StyleSheet, ImageBackground} from 'react-native';
import {setClientId} from '../globalVariables/clientID';

const HomeScreen = ({navigation}) => {
  return (
    <ImageBackground
      source={require('../Images/foodWallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.container}>
        <Text style={styles.title}>Inicio</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Ver Menú"
            onPress={() => navigation.navigate('ShoppingScreen')}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Ver mis pedidos activos"
            onPress={() => navigation.navigate('ActiveOrdersScreen')}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Actualizar mi cuenta"
            onPress={() => navigation.navigate('UpdateScreen')}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Cerrar sesión"
            onPress={() => {
              setClientId(null);
              navigation.navigate('LoginScreen');
            }}
          />
        </View>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    marginVertical: 10,
    width: '70%',
  },
});

export default HomeScreen;
