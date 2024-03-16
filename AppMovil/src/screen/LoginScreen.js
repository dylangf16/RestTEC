import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import config from '../../src/config/config'; // Import the configuration file
import { setClientId } from '../globalVariables/clientID';

const ip = config.ip;

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    // Prepare user data
    const userData = {
      correo: email,
      contrasena: password
    };

    // Send POST request to Flask server for login
    fetch('http://'+ ip +':5000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          const { client_id } = data;
          // Set client ID in the global variable
          setClientId(client_id);
          Alert.alert('Inicio de sesion', 'Se ha iniciado sesion con exito.');
          navigation.navigate('HomeScreen');
        });
      } else {
        Alert.alert('Error', 'Correo electrónico o contraseña incorrectos.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      Alert.alert('Error', 'Hubo un problema al intentar iniciar sesión.');
    });
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

        <View style={styles.buttonContainer}>
        <Text style={styles.text}>¿Aún no tienes cuenta?</Text>
        <Button title="Registrarse" onPress={() => navigation.navigate('RegisterScreen')} />
        </View>

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
  text: {
    fontSize: 14,
    marginBottom: 10,
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
