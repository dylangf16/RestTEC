import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';


const LoginScreen = ({ navigation }) => { // Don't forget to include 'navigation' in the props

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  console.log('Email:', email);
  console.log('Password:', password);

  const handleLogin = () => {
    // Create user data object
    const userData = {
      correo: email, // Use 'correo' instead of 'email'
      contrasena: password, // Use 'contrasena' instead of 'password'
    };

    // Send POST request to login endpoint
    fetch(`http://10.0.2.2:5274/login`, { // Update the endpoint to '/login' and use the correct port
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
          <Text style={styles.registerText}>¿No tienes una cuenta? ¡Regístrate aquí!</Text>
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
