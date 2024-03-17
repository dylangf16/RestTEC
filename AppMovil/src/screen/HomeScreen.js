import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { setClientId } from '../globalVariables/clientID';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Ver Menu"
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
          title="Cerrar sesion"
          onPress={() => {
            setClientId(null);
            navigation.navigate('LoginScreen');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '70%',
  },
});

export default HomeScreen;
