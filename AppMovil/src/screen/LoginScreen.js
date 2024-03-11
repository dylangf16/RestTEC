import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import config from '../../src/config/config'; // Import the configuration file

const ip = config.ip;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (navigation) => {
    // Create user data object
    const userData = {
      correo: email,
      contrasena: password,
    };

    // Send POST request to login endpoint
    fetch(`http://${ip}:5000/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => {
        if (response.ok) {
          Alert.alert('¡Inicio de sesión exitoso!');
          // Here you could redirect the user to the menu screen
        } else {
          Alert.alert('Error', 'Credenciales incorrectas');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Error', 'Hubo un problema al intentar iniciar sesión.');
      });
  };

  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inicio de Sesión</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
        />
        <View style={styles.buttonContainer}>
          <Button title="Iniciar Sesión" onPress={handleLogin} />
        </View>

        <TouchableOpacity onPress={handleNavigateToRegister}>
          <Text style={styles.registerText}>Don't have an account? Register here!</Text>
       </TouchableOpacity>

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
  formContainer: {
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default LoginScreen;
